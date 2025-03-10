import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Map<string, { product: any, quantity: number, volume: string }> = new Map();
  private cartSubject: BehaviorSubject<Map<string, { product: any, quantity: number, volume: string }>> = new BehaviorSubject(new Map());
  private userId: string | null = null;
  selectedCartItems: any[] = [];
  constructor() {
   
  }

  getCart(): any[] {
    const userId = this.getUserId(); // Lấy userId từ session/localStorage
    if (!userId) {
      console.warn("⚠️ Không có userId, không thể lấy giỏ hàng!");
      return [];
    }
  
    const storedCart = localStorage.getItem(`cart-${userId}`);
    if (storedCart) {
      console.log("📦 Giỏ hàng lấy từ localStorage:", JSON.parse(storedCart));
      return JSON.parse(storedCart).map(([key, value]: [string, any]) => value);
    }
  
    console.log("🛒 Giỏ hàng trống trong localStorage.");
    return [];
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
  addToCart(product: any, quantity: number = 1): void {
    if (!product || !product.idSanPham) {
        console.error("❌ Không thể thêm sản phẩm không hợp lệ vào giỏ hàng!", product);
        return;
    }

    const productKey = `${product.idSanPham}_${product.dungTich}`;
    console.log(`🛒 Đang thêm vào giỏ hàng - Key: ${productKey}`);

    if (this.cart.has(productKey)) {
        const existingProduct = this.cart.get(productKey);
        if (existingProduct) {
            existingProduct.quantity = (existingProduct.quantity || 0) + quantity;
            this.cart.set(productKey, existingProduct);
        } else {
            console.warn(`⚠️ Sản phẩm có key ${productKey} bị undefined!`, existingProduct);
        }
    } else {
        this.cart.set(productKey, {
            product: { ...product }, // Lưu bản sao của sản phẩm
            quantity,
            volume: product.dungTich
        });
    }

    console.log("✅ Giỏ hàng hiện tại:", Array.from(this.cart.entries()));

    this.updateCartInLocalStorage();
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
    if (!this.userId) {
        console.warn("⚠️ Không có userId, không lưu giỏ hàng!");
        return;
    }

    const cartArray = Array.from(this.cart.entries()).map(([key, value]) => {
        if (!value || !value.product) {
            console.warn(`⚠️ Bỏ qua mục không hợp lệ trong giỏ hàng - Key: ${key}`, value);
            return null;
        }
        return [key, value];
    }).filter(item => item !== null);

    localStorage.setItem(`cart-${this.userId}`, JSON.stringify(cartArray));
    console.log(`✅ Giỏ hàng đã cập nhật vào localStorage cho userId ${this.userId}:`, cartArray);
}

  
 
  removeFromCart(productKey: string): void {
    if (this.cart.has(productKey)) {
      this.cart.delete(productKey);
      this.updateCartInLocalStorage();
      this.cartSubject.next(new Map(this.cart));
      console.log(`Product ${productKey} removed from cart.`);
    } else {
      console.log(`Product ${productKey} not found in cart.`);
    }
  }
  updateCart(productKey: string, quantity: number, volume: string): void {
    if (this.cart.has(productKey)) {
      const existingProduct = this.cart.get(productKey);
      if (existingProduct) {
        // Update the existing product with the new quantity
        this.cart.set(productKey, { ...existingProduct, quantity: quantity });
        this.updateCartInLocalStorage();
        this.cartSubject.next(new Map(this.cart));
      }
    } else {
      // Optionally handle the case where product is not found in the cart
      console.log('Product not found in cart, could not update.');
    }
  }
  
  

  private saveCartToLocalStorage(userId: string): void {
    // Chỉ thực hiện lưu vào localStorage nếu đang ở trên client-side
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(`cart-${userId}`, JSON.stringify(Array.from(this.cart.entries())));
    }
  }
  loadCartFromLocalStorage(): void {
    const storedCart = localStorage.getItem(`cart-${this.userId}`);
    if (storedCart) {
      this.cart = new Map(JSON.parse(storedCart));
      this.cartSubject.next(new Map(this.cart));
      console.log('Cart loaded from localStorage:', this.cart);
    } else {
      console.log('No cart found in localStorage.');
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
  setSelectedCartItems(items: any[]) {
    this.selectedCartItems = items;
  }
  
  getSelectedCartItems() {
    return this.selectedCartItems;
  }
  
  clearSelectedItems() {
    this.selectedCartItems = [];
  }
}
