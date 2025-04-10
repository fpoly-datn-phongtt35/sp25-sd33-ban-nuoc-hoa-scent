import { Component,OnInit,ChangeDetectorRef } from '@angular/core';
// import { FooterComponent } from '../footer/footer.component';
// import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { CartService } from '../service/cart.Service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../service/token.service';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss'] // Sửa thành "styleUrls"
})

export class ShoppingCartComponent implements OnInit{
  cartItems: any[] = [];
  isAllSelected: boolean = false; // Trạng thái chọn tất cả

  userId: string | null = null;
  private subscriptions: Subscription = new Subscription();
  selectedProducts: any[] = [];
  totalAmount: number = 0; // Tổng tiền của sản phẩm đã chọn
  constructor(private cartService: CartService,private cdr: ChangeDetectorRef,private tokenService: TokenService,private router: Router) {}

  ngOnInit() {
    // Đăng ký Observable để nhận thông tin cập nhật giỏ hàng và userId
    this.subscriptions.add(
      this.cartService.getCartObservable().subscribe(() => {
        this.loadCartItemsFromLocalStorage();
      })
    );
  }
  onProductSelect(product: any, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;

    if (isChecked) {
        this.selectedProducts.push(product);
    } else {
        this.selectedProducts = this.selectedProducts.filter(p => p.product.idSanPham !== product.product.idSanPham);
    }
    this.selectedProducts.forEach(item => {
      console.log(`🛒 SP: ${item.product.tenSanPham} | SL: ${item.quantity} | Giá: ${item.product.donGia}`);
  });


    // Cập nhật trạng thái "Chọn tất cả" dựa trên số lượng sản phẩm được chọn
    this.isAllSelected = this.selectedProducts.length === this.cartItems.length;
    this.calculateTotal();
}



  placeOrder() {
    // Lưu danh sách sản phẩm đã chọn vào localStorage để sử dụng ở trang đặt hàng
    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
    this.router.navigate(['/app-order']);
  }

  ngOnDestroy() {
    // Hủy đăng ký để tránh memory leaks
    this.subscriptions.unsubscribe();
  }

  trackByProduct(index: number, item: any): number | null {
    return item?.product?.idSanPham ?? null;
  }


  loadCartItemsFromLocalStorage() {
    const userId = this.tokenService.getUserId();
    if (!userId) {
        console.warn("⚠️ Không có userId, không thể tải giỏ hàng từ localStorage!");
        this.cartItems = [];
        return;
    }

    const storedCartData = localStorage.getItem(`cart-${userId}`);
    if (!storedCartData) {
        console.log("📭 Không có giỏ hàng nào trong localStorage.");
        this.cartItems = [];
        return;
    }

    try {
        const parsedCart = JSON.parse(storedCartData);
        console.log("📥 Dữ liệu giỏ hàng từ localStorage:", parsedCart);

        this.cartItems = parsedCart
            .map((item: any) => {
                if (!item || !item[1] || !item[1].product) {
                    console.warn("⚠️ Mục giỏ hàng không hợp lệ:", item);
                    return null;
                }
                if (item[1].product.imageURL) {
                  item[1].product.imageURL = item[1].product.imageURL.split(',').map((url: string) => url.trim());
                }
                return {
                    product: item[1].product,
                    quantity: item[1].quantity,
                    volume: item[1].volume
                };
            })
            .filter((item: any) => item !== null); // Loại bỏ các mục không hợp lệ

        console.log("✅ Giỏ hàng sau khi load:", this.cartItems);
        this.cdr.detectChanges(); // Cập nhật giao diện

    } catch (error) {
        console.error("❌ Lỗi khi parse JSON giỏ hàng từ localStorage:", error);
        this.cartItems = [];
    }
}






  removeItem(productId: number, volume: string): void {
    const productKey = `${productId}_${volume}`;
    this.cartService.removeFromCart(productKey);
    console.log('Giỏ hàng sau khi xóa:', this.cartItems);
  }


  updateLocalStorage() {
    const userId = this.tokenService.getUserId();
    localStorage.setItem(`cart-${userId}`, JSON.stringify(this.cartItems));
    this.cdr.detectChanges();
  }

  getTotal(): number {
    return this.cartItems.reduce((acc, item) => acc + (item.quantity * item.product.donGia), 0);
  }

  selectAll(isChecked: boolean) {
    this.cartItems.forEach(item => item.selected = isChecked);
    this.cdr.detectChanges();
  }
  toggleSelectAll() {
    this.isAllSelected = !this.isAllSelected; // Đảo trạng thái chọn tất cả

    if (this.isAllSelected) {
        this.selectedProducts = [...this.cartItems]; // Chọn tất cả sản phẩm
    } else {
        this.selectedProducts = []; // Bỏ chọn tất cả
    }

    // Cập nhật trạng thái checkbox của từng sản phẩm
    this.cartItems.forEach(item => item.selected = this.isAllSelected);
    this.calculateTotal();
    this.cdr.detectChanges(); // Cập nhật giao diện
}
calculateTotal() {
  this.totalAmount = this.selectedProducts.reduce((sum, item) => {

      return sum + (Number(item.quantity) * Number(item.product.donGia));
  }, 0);
}
updateQuantity(item: any, newQuantity: number) {
  if (newQuantity < 1) {
    newQuantity = 1;
    item.quantity = 1; // Đồng bộ item.quantity với giá trị mới
  } else {
    item.quantity = newQuantity; // Đồng bộ item.quantity với giá trị mới
  }
  console.log(`🔔 Cập nhật số lượng - Sản phẩm: ${item.product.tenSanPham}, Số lượng: ${newQuantity}`);
  this.cartService.updateCartItem(item.product.idSanPham, item.volume, newQuantity);
  console.log(`🔔 Đã gọi updateCartItem - Sản phẩm: ${item.product.tenSanPham}, Số lượng: ${newQuantity}`);
  if (this.selectedProducts.includes(item)) {
    this.calculateTotal();
  }
  this.cdr.detectChanges();
}
logQuantityChange(item: any, newValue: number) {
  console.log(`📝 ngModelChange - Sản phẩm: ${item.product.tenSanPham}, Giá trị mới: ${newValue}`);
}
}
