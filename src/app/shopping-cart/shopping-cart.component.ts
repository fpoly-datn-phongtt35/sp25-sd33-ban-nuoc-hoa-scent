import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItemWithKey } from '../service/cart.Service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
  cartItems: CartItemWithKey[] = [];
  totalPrice: number = 0;
  selectedProducts: CartItemWithKey[] = [];
  private cartSubscription: Subscription;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.getCartObservable().subscribe(cart => {
      console.log('🛒 Nhận cập nhật giỏ hàng từ observable:', Array.from(cart.entries()));
      this.cartItems = Array.from(cart.entries()).map(([key, value]) => ({
        key,
        ...value
      }));
      console.log('🛒 Cập nhật giỏ hàng trên giao diện:', this.cartItems);
      this.selectedProducts = this.selectedProducts.filter(sp =>
        this.cartItems.some(item => item.key === sp.key)
      );
      this.calculateTotalPrice();
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  calculateTotalPrice(): void {
    this.totalPrice = this.selectedProducts.reduce((total, item) => {
      return total + (item.product.donGia * item.quantity);
    }, 0);
  }

  updateQuantity(key: string, quantity: number): void {
    const [productId, volume] = key.split('_');
    if (quantity < 1) {
      this.removeItem(key);
      return;
    }

    const item = this.cartItems.find(i => i.key === key);
    if (item && item.product.soLuongTonKho !== undefined && quantity > item.product.soLuongTonKho) {
      Swal.fire({
        icon: 'error',
        title: 'Số lượng vượt quá tồn kho',
        text: `"${item.product.tenSanPham}" chỉ còn ${item.product.soLuongTonKho} sản phẩm trong kho!`,
        position: 'bottom-end'
      });
      return;
    }

    console.log('📝 Gọi updateCartItem: productId=', productId, 'volume=', volume, 'quantity=', quantity);
    this.cartService.updateCartItem(Number(productId), volume, quantity);
  }

  removeItem(key: string): void {
    Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then(result => {
      if (result.isConfirmed) {
        this.cartService.removeFromCart(key);
        this.selectedProducts = this.selectedProducts.filter(item => item.key !== key);
        this.calculateTotalPrice();
      }
    });
  }

  clearCart(): void {
    Swal.fire({
      title: 'Xác nhận',
      text: 'Bạn có chắc muốn xóa toàn bộ giỏ hàng?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then(result => {
      if (result.isConfirmed) {
        this.cartService.clearCart();
        this.selectedProducts = [];
        this.calculateTotalPrice();
      }
    });
  }

  checkout(): void {
    if (this.selectedProducts.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn sản phẩm',
        text: 'Vui lòng chọn ít nhất một sản phẩm để thanh toán!',
        position: 'bottom-end'
      });
      return;
    }

    const overStockItems = this.selectedProducts.filter(item => {
      const soLuongTonKho = item.product.soLuongTonKho ?? 0;
      return item.quantity > soLuongTonKho;
    });

    if (overStockItems.length > 0) {
      const message = overStockItems
        .map(item => {
          const soLuongTonKho = item.product.soLuongTonKho ?? 0;
          return `"${item.product.tenSanPham}" (Số lượng: ${item.quantity}, Tồn kho: ${soLuongTonKho})`;
        })
        .join('<br>');

      Swal.fire({
        icon: 'error',
        title: 'Số lượng vượt quá tồn kho',
        html: `Các sản phẩm sau đã vượt quá số lượng tồn kho:<br>${message}`,
        position: 'bottom-end'
      });
      return;
    }

    // Lưu vào CartService và chuyển hướng
    this.cartService.setSelectedCartItems(this.selectedProducts);
    this.router.navigate(['/app-order']);
  }

  onProductSelect(item: CartItemWithKey, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      if (!this.selectedProducts.includes(item)) {
        this.selectedProducts.push(item);
      }
    } else {
      this.selectedProducts = this.selectedProducts.filter(selectedItem => selectedItem.key !== item.key);
    }
    this.calculateTotalPrice();
  }

  isProductSelected(item: CartItemWithKey): boolean {
    return this.selectedProducts.some(selectedItem => selectedItem.key === item.key);
  }

  trackByProduct(index: number, item: CartItemWithKey): string {
    return item.key;
  }

  onImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    const defaultImage = 'assets/placeholder-image.jpg';
    imgElement.src = defaultImage;
    imgElement.onerror = () => {
      console.warn('⚠️ Hình ảnh mặc định không tồn tại:', defaultImage);
      imgElement.src = '';
    };
  }
}
