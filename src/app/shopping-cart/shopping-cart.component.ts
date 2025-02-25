import { Component,OnInit,ChangeDetectorRef } from '@angular/core';
// import { FooterComponent } from '../footer/footer.component';
// import { HeaderComponent } from '../header/header.component';
import { CommonModule } from '@angular/common';
import { CartService } from '../service/cart.Service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../service/token.service';
@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss'] // Sửa thành "styleUrls"
})

export class ShoppingCartComponent implements OnInit{
  cartItems: any[] = [];
  userId: string | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(private cartService: CartService,private cdr: ChangeDetectorRef,private tokenService: TokenService) {}
 
  ngOnInit() {
    // Đăng ký Observable để nhận thông tin cập nhật giỏ hàng và userId
    this.subscriptions.add(
      this.cartService.getCartObservable().subscribe(() => {
        this.loadCartItemsFromLocalStorage();
      })
    );
  }

  ngOnDestroy() {
    // Hủy đăng ký để tránh memory leaks
    this.subscriptions.unsubscribe();
  }

  trackByProduct(index: number, item: any): number {
    return item.product.productId; // Hoặc một định danh duy nhất khác của sản phẩm
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
      const storedCart = JSON.parse(storedCartData);
      console.log("📥 Dữ liệu giỏ hàng từ localStorage:", storedCart);

      this.cartItems = storedCart.map((item: any) => {
        if (item && typeof item === "object" && "product" in item && "quantity" in item) {
          return item;
        }
        // Kiểm tra xem item có phải là mảng với đúng 2 phần tử, phần tử đầu tiên không phải null/undefined và phần tử thứ hai là số
        if (Array.isArray(item) && item.length === 2 && item[0] && typeof item[1] === "number") {
          return {
            product: item[0],
            quantity: item[1]
          };
        } else {
          console.warn("⚠️ Mục giỏ hàng không hợp lệ hoặc thiếu thông tin:", item);
          return null;
        }
      }).filter((item: any) => item !== null); // Loại bỏ các mục null
      
      this.cdr.detectChanges(); // Cập nhật giao diện
    } catch (error) {
      console.error("❌ Lỗi khi parse JSON giỏ hàng từ localStorage:", error);
      this.cartItems = [];
    }
  }


  removeItem(productId: number): void {
    this.cartService.removeFromCart(productId);
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
}