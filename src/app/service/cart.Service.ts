import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Map<number, number> = new Map();
  private cartSubject: BehaviorSubject<Map<number, number>> = new BehaviorSubject(new Map());
  private userId: string | null = null;

  constructor() {
   
  }

  
  setUserId(userId: string | null): void {
    this.userId = userId;
    console.log('user đăng nhập',userId)
    if (userId) {
      this.loadCartFromLocalStorage(); // Tải giỏ hàng khi người dùng đăng nhập
    } else {
     
      this.cartSubject.next(new Map()); // Cập nhật cho các subscribers
    }
  }
  getUserId(): string | null {
    if (this.userId) {
      return this.userId; // Trả về userId nếu đã có
    }
  
    // Nếu chưa có, thử lấy từ localStorage
    const storedUserId = localStorage.getItem("currentUserId");
    if (storedUserId) {
      console.log("🔄 UserID khôi phục từ localStorage:", storedUserId);
      this.setUserId(storedUserId); // Cập nhật vào CartService
      return storedUserId;
    }
  
    console.warn("⚠️ Không tìm thấy userId!");
    return null; // Trả về null nếu không có userId
  }
  
 

  addToCart(productId: number, quantity: number = 1): void {
    console.log('Adding product to cart:', productId, quantity);
    
    if (this.cart.has(productId)) {
      this.cart.set(productId, (this.cart.get(productId) || 0) + quantity);
    } else {
      this.cart.set(productId, quantity);
    }
    this.updateCartInLocalStorage(); // Gọi hàm cập nhật cart vào localStorage
    this.cartSubject.next(new Map(this.cart));
}
  
  private saveCart(): void {
    if (!this.userId) {
      console.log("No user logged in, saving cart temporarily.");
      // Tạm thời lưu giỏ hàng cho người dùng chưa đăng nhập
      localStorage.setItem('temp-cart', JSON.stringify(Array.from(this.cart.entries())));
    } else {
      localStorage.setItem(`cart-${this.userId}`, JSON.stringify(Array.from(this.cart.entries())));
      console.log(`Cart updated in localStorage for userId ${this.userId}`);
    }
  }
  

  updateCartInLocalStorage(): void {
    console.log("🔹 Đang chạy updateCartInLocalStorage...");
    console.log("📌 userId hiện tại:", this.userId);
  
    if (!this.userId) {
      console.warn("⛔ Không có userId, không lưu giỏ hàng!");
      return;
    }
    
  
    const cartArray = Array.from(this.cart.entries());
    localStorage.setItem(`cart-${this.userId}`, JSON.stringify(cartArray));
    console.log(`✅ Giỏ hàng đã cập nhật trong localStorage cho userId ${this.userId}:`, cartArray);
  }
  
 
  
  public removeFromCart(productId: number): void {
    console.log("🔹 Đang chạy updateCartInLocalStorage...");
    console.log("📌 userId hiện tại khi xoá:", this.userId);
    console.log("Current cart items:", Array.from(this.cart.entries()));

    if (!this.userId) {
      console.error("No user logged in, cannot remove product.");
      return;
    }
  
    // Đảm bảo productId là kiểu số nguyên
    const productKey = Number(productId); 
  
    if (this.cart.has(productKey)) {
      this.cart.delete(productKey);
      this.updateCartInLocalStorage();
      this.cartSubject.next(new Map(this.cart));
      console.log(`Product ${productId} removed from cart for user ${this.userId}`);
    } else {
      console.log(`Product ${productId} not found in cart for user ${this.userId}`);
    }
  }
  
  


  public updateCart(productId: number, quantity: number): void {
    if (!this.userId) return;
    if (quantity > 0) {
      this.cart.set(productId, quantity);
    } else {
      this.removeFromCart(productId);
    }
    this.updateCartInLocalStorage();
  }

  public clearCart(): void {
    this.cart.clear();
    this.updateCartInLocalStorage();
  }

  

  private saveCartToLocalStorage(userId: string): void {
    // Chỉ thực hiện lưu vào localStorage nếu đang ở trên client-side
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`cart-${userId}`, JSON.stringify(Array.from(this.cart.entries())));
    }
  }
  
  private loadCartFromLocalStorage(): void {
    if (!this.userId) return;
    
    const storedCart = localStorage.getItem(`cart-${this.userId}`);
    if (storedCart) {
      this.cart = new Map(JSON.parse(storedCart));
      this.cartSubject.next(new Map(this.cart));
      console.log(`Cart loaded from localStorage for userId ${this.userId}`, this.cart);
    } else {
      console.log(`No cart found in localStorage for userId ${this.userId}`);
    }
  }
  
  clearCartOnClient(): void {
    this.cart.clear();
    this.cartSubject.next(new Map());
    console.log("Cart has been cleared on the client-side.");
  }
  
 
  

  public getCartObservable() {
    return this.cartSubject.asObservable();
  }

  public getCartOrderCount(): number {
    return this.cart.size;
  }

  public getItems(): any[] {
    return Array.from(this.cart.entries()).map(([productId, quantity]) => ({ productId, quantity }));
  }
  
}
