import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../service/cart.Service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TokenService } from '../service/token.service';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
  cartItems: any[] = [];
  isAllSelected: boolean = false;
  selectedProducts: any[] = [];
  totalAmount: number = 0;
  userId: string | null = null;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private cartService: CartService,
    private cdr: ChangeDetectorRef,
    private tokenService: TokenService,
    private router: Router
  ) {}

  ngOnInit() {
    // Lấy thông tin người dùng từ TokenService
    this.updateUserId();

    // Đặt userId cho CartService
    this.cartService.setUserId(this.userId);

    // Đăng ký observable để cập nhật giỏ hàng
    this.subscriptions.add(
      this.cartService.getCartObservable().subscribe({
        next: (cart) => {
          console.log('📥 Cart updated via observable:', Array.from(cart.entries()));
          this.loadCartItems();
        },
        error: (err) => {
          console.error('❌ Lỗi khi đăng ký giỏ hàng observable:', err);
        }
      })
    );

    // Listen for login/logout events
    this.subscriptions.add(
      this.tokenService.getUserInfoObservable().subscribe((userInfo) => {
        console.log('👤 User info change detected:', userInfo);
        const newUserId = userInfo && userInfo.UserID ? String(userInfo.UserID) : null;
        if (newUserId !== this.userId) {
          this.userId = newUserId;
          console.log('🔄 UserID updated in ShoppingCart:', this.userId);
          this.cartService.setUserId(this.userId);
          this.cartService.reloadCart();
        }
      })
    );

    // Listen for navigation events to re-load the cart
    this.subscriptions.add(
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.updateUserId();
          this.cartService.setUserId(this.userId);
          this.cartService.reloadCart();
        }
      })
    );

    // Tải giỏ hàng ban đầu
    this.cartService.reloadCart();
  }

  private updateUserId(): void {
    const userId = this.tokenService.getUserId();
    this.userId = userId > 0 ? String(userId) : null;
    console.log('👤 UserID trong ShoppingCart:', this.userId);
  }

  loadCartItems() {
    this.cartItems = this.cartService.getCart().map(item => ({
      ...item,
      selected: this.selectedProducts.some(
        p => p.product.idSanPham === item.product.idSanPham && p.volume === item.volume
      )
    }));

    this.isAllSelected = this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
    this.calculateTotal();
    console.log('🛒 Giỏ hàng đã tải:', this.cartItems);
    this.cdr.detectChanges();
  }

  onProductSelect(product: any, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    product.selected = isChecked;

    if (isChecked) {
      if (!this.selectedProducts.includes(product)) {
        this.selectedProducts.push(product);
      }
    } else {
      this.selectedProducts = this.selectedProducts.filter(
        p => p.product.idSanPham !== product.product.idSanPham || p.volume !== product.volume
      );
    }

    this.selectedProducts.forEach(item => {
      console.log(`🛒 SP: ${item.product.tenSanPham} | SL: ${item.quantity} | Giá: ${item.product.donGia}`);
    });

    this.isAllSelected = this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
    this.calculateTotal();
    this.cdr.detectChanges();
  }

  toggleSelectAll() {
    this.isAllSelected = !this.isAllSelected;
    this.cartItems.forEach(item => (item.selected = this.isAllSelected));

    if (this.isAllSelected) {
      this.selectedProducts = [...this.cartItems];
    } else {
      this.selectedProducts = [];
    }

    this.calculateTotal();
    this.cdr.detectChanges();
  }

  calculateTotal() {
    this.totalAmount = this.selectedProducts.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.product.donGia));
    }, 0);
    console.log('💰 Tổng tiền:', this.totalAmount);
  }

  updateQuantity(item: any, newQuantity: number) {
    if (newQuantity < 1) {
      newQuantity = 1;
      item.quantity = 1;
    } else {
      item.quantity = newQuantity;
    }

    console.log(`🔔 Cập nhật số lượng - Sản phẩm: ${item.product.tenSanPham}, Số lượng: ${newQuantity}`);
    this.cartService.updateCartItem(item.product.idSanPham, item.volume, newQuantity);

    if (this.selectedProducts.includes(item)) {
      this.calculateTotal();
    }
    this.cdr.detectChanges();
  }

  logQuantityChange(item: any, newValue: number) {
    console.log(`📝 ngModelChange - Sản phẩm: ${item.product.tenSanPham}, Giá trị mới: ${newValue}`);
  }

  removeItem(productId: number, volume: string): void {
    const productKey = `${productId}_${volume}`;
    this.cartService.removeFromCart(productKey);
    this.selectedProducts = this.selectedProducts.filter(
      p => p.product.idSanPham !== productId || p.volume !== volume
    );
    this.calculateTotal();
    this.isAllSelected = this.cartItems.length > 0 && this.cartItems.every(item => item.selected);
    this.cdr.detectChanges();
  }

  placeOrder() {
    if (this.selectedProducts.length === 0) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng chọn ít nhất một sản phẩm để đặt hàng!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }

    localStorage.setItem('selectedProducts', JSON.stringify(this.selectedProducts));
    this.cartService.setSelectedCartItems(this.selectedProducts);
    this.router.navigate(['/app-order']);
  }

  getTotal(): number {
    const total = this.cartItems.reduce((acc, item) => acc + (item.quantity * item.product.donGia), 0);
    console.log('💰 Tổng tiền giỏ hàng:', total);
    return total;
  }

  trackByProduct(index: number, item: any): string {
    return `${item?.product?.idSanPham}_${item?.volume}` ?? `${index}`;
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}