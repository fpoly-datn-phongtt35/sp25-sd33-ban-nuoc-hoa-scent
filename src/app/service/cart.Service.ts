import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Map<number, number> = new Map(); // Sử dụng Map để lưu trữ giỏ hàng, key là id sản phẩm, value là số lượng
  private cartItems: any[] = [];
  private cartSubject: BehaviorSubject<Map<number, number>> = new BehaviorSubject(this.cart);

  
  constructor() {
    this.loadCartFromLocalStorage(); // Tải giỏ hàng từ localStorage khi khởi tạo
  }

  // Phương thức thêm sản phẩm vào giỏ hàng
  addToCart(productId: number, quantity: number = 1): void {
    console.log('Adding product to cart:', productId, quantity);
    if (this.cart.has(productId)) {
      this.cart.set(productId, (this.cart.get(productId) || 0) + quantity);
    } else {
      this.cart.set(productId, quantity);
    }
    this.saveCartToLocalStorage();
  }
  

  // Phương thức lấy giỏ hàng
  getCart(): Map<number, number> {
    return this.cart;
  }

  // Lưu giỏ hàng vào localStorage
  private saveCartToLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      console.log('Cart before saving to localStorage:', this.cart);
      localStorage.setItem('cart', JSON.stringify(Array.from(this.cart.entries())));
    }
  }

  // Tải giỏ hàng từ localStorage
  private loadCartFromLocalStorage(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        this.cart = new Map(JSON.parse(storedCart));
        console.log('Cart loaded from localStorage:', this.cart); // Kiểm tra giỏ hàng đã được tải lại
      }
    }
  }

  // Phương thức xóa sản phẩm khỏi giỏ hàng
  removeFromCart(productId: number): void {
    if (this.cart.has(productId)) {
      this.cart.delete(productId);
      this.saveCartToLocalStorage(); // Cập nhật lại localStorage sau khi xóa sản phẩm
      this.updateCart1();
      
    }
  }
  getCartObservable() {
    return this.cartSubject.asObservable();
  }
  private updateCart1(): void {
    this.saveCartToLocalStorage();
    this.cartSubject.next(this.cart);
  }
  // Phương thức cập nhật số lượng sản phẩm
  updateCart(productId: number, quantity: number): void {
    if (this.cart.has(productId) && quantity > 0) {
      this.cart.set(productId, quantity);
      this.saveCartToLocalStorage(); // Lưu trữ lại giỏ hàng sau khi cập nhật
    } else if (quantity <= 0) {
      this.removeFromCart(productId); // Nếu số lượng <= 0, xóa sản phẩm khỏi giỏ hàng
    }
  }
  getCartOrderCount(): number {
    return this.cart.size; // Đếm số lượng loại sản phẩm trong giỏ hàng
  }
  
  // Phương thức làm trống giỏ hàng
  clearCart(): void {
    this.cart.clear();
    this.saveCartToLocalStorage(); // Xóa giỏ hàng từ localStorage
  }
  getItems() {
    const items = localStorage.getItem('cart');
    return items ? JSON.parse(items) : [];
  }
  saveItems(items: any[]) {
    localStorage.setItem('cart', JSON.stringify(items));
  }
}
