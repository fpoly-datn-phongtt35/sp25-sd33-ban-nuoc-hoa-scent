import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItemWithKey } from '../service/cart.Service';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { WebSocketService } from '../service/WebSocketService';

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
  private spctWebSocketSubscription: Subscription | undefined;
  private adminWebSocketSubscription: Subscription | undefined; // Thêm subscription cho admin messages

  constructor(
    private cartService: CartService,
    private router: Router,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    // Đăng ký observable từ CartService để cập nhật giỏ hàng
    this.cartSubscription = this.cartService.getCartObservable().subscribe(cart => {
      console.log('🛒 Nhận cập nhật giỏ hàng từ observable:', Array.from(cart.entries()));
      this.cartItems = Array.from(cart.entries()).map(([key, value]) => ({
        key,
        ...value
      }));
      console.log('🛒 Cập nhật giỏ hàng trên giao diện:', this.cartItems);

      // Đồng bộ selectedProducts với cartItems
      this.selectedProducts = this.selectedProducts.map(selectedItem => {
        const updatedItem = this.cartItems.find(item => item.key === selectedItem.key);
        if (updatedItem) {
          return {
            ...selectedItem,
            quantity: updatedItem.quantity,
            product: { ...selectedItem.product, soLuongTonKho: updatedItem.product.soLuongTonKho }
          };
        }
        return selectedItem;
      }).filter(sp => this.cartItems.some(item => item.key === sp.key));

      this.calculateTotalPrice();
    });

    // Kết nối WebSocket
    console.log('[ShoppingCartComponent] Connecting WebSocket');
    this.webSocketService.connect(0);

    // Đăng ký lắng nghe thông báo từ /topic/spctUpdates
    this.spctWebSocketSubscription = this.webSocketService.getSpctUpdates().subscribe({
      next: (update: any) => {
        console.log('[ShoppingCartComponent] SPCT update received from /topic/spctUpdates:', update);
        this.handleStockUpdate(update);
      },
      error: (err) => {
        console.error('[ShoppingCartComponent] WebSocket error (spctUpdates):', err);
      }
    });

    // Đăng ký lắng nghe thông báo từ /topic/admin/orders
    this.adminWebSocketSubscription = this.webSocketService.getAdminMessages().subscribe({
      next: (update: any) => {
        console.log('[ShoppingCartComponent] Admin message received from /topic/admin/orders:', update);
        this.handleStockUpdate(update);
      },
      error: (err) => {
        console.error('[ShoppingCartComponent] WebSocket error (admin/orders):', err);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
    if (this.spctWebSocketSubscription) {
      this.spctWebSocketSubscription.unsubscribe();
    }
    if (this.adminWebSocketSubscription) {
      this.adminWebSocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
    console.log('[ShoppingCartComponent] Disconnected WebSocket and unsubscribed');
  }

  private handleStockUpdate(update: any) {
    const productId = update.productId;
    const newStock = update.stock;

    if (productId === undefined || newStock === undefined) {
      console.warn('[ShoppingCartComponent] Invalid WebSocket update:', update);
      return;
    }

    // Cập nhật số lượng tồn kho trong CartService trước
    this.cartService.updateStock(productId, newStock);

    // Cập nhật cartItems
    this.cartItems = this.cartItems.map(item => {
      if (item.product.idSanPham === productId) {
        console.log(`[ShoppingCartComponent] Updating stock for product ${productId}: ${item.product.soLuongTonKho} -> ${newStock}`);
        item.product.soLuongTonKho = newStock;

        if (newStock <= 0) {
          this.cartService.removeFromCart(item.key);
          this.selectedProducts = this.selectedProducts.filter(selected => selected.key !== item.key);
          Swal.fire({
            icon: 'warning',
            title: 'Sản phẩm hết hàng',
            text: `"${item.product.tenSanPham}" đã hết hàng và được xóa khỏi giỏ hàng!`,
            position: 'bottom-end'
          });
          return null;
        } else if (item.quantity > newStock) {
          console.log(`[ShoppingCartComponent] Adjusting quantity for ${item.product.tenSanPham}: ${item.quantity} -> ${newStock}`);
          item.quantity = newStock;
          this.cartService.updateCartItem(item.product.idSanPham, item.product.dungTich.toString(), newStock);
          Swal.fire({
            icon: 'warning',
            title: 'Số lượng đã được điều chỉnh',
            text: `Số lượng của "${item.product.tenSanPham}" đã được điều chỉnh về ${newStock} do tồn kho thay đổi!`,
            position: 'bottom-end'
          });
        }
      }
      return item;
    }).filter(item => item !== null);

    // Đồng bộ selectedProducts
    this.selectedProducts = this.selectedProducts.map(selectedItem => {
      const updatedItem = this.cartItems.find(item => item.key === selectedItem.key);
      if (updatedItem) {
        return {
          ...selectedItem,
          quantity: updatedItem.quantity,
          product: { ...selectedItem.product, soLuongTonKho: updatedItem.product.soLuongTonKho }
        };
      }
      return selectedItem;
    }).filter(sp => this.cartItems.some(item => item.key === sp.key));

    this.calculateTotalPrice();

    if (this.cartItems.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Giỏ hàng trống',
        text: 'Giỏ hàng của bạn hiện đang trống!',
        position: 'bottom-end'
      });
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

    if (item) {
      item.quantity = quantity;
      const selectedItem = this.selectedProducts.find(sp => sp.key === key);
      if (selectedItem) {
        selectedItem.quantity = quantity;
      }
      this.calculateTotalPrice();
    }
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