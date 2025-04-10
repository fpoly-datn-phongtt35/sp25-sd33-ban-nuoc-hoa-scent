import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TokenService } from '../service/token.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cart: Map<string, { product: any, quantity: number, volume: string }> = new Map();
  private cartSubject: BehaviorSubject<Map<string, { product: any, quantity: number, volume: string }>> = new BehaviorSubject(new Map());
  private userId: string | null = null;
  selectedCartItems: any[] = [];

  constructor(private tokenService: TokenService) {
    // Do not load the cart in the constructor to avoid premature loading
  }

  private loadCart(): void {
    const userId = this.getUserId();
    console.log('🔍 Loading cart for userId:', userId);
    if (userId) {
      this.loadCartForUser(userId);
    } else {
      this.loadTempCart();
    }
  }

  private loadTempCart(): void {
    const storedCart = localStorage.getItem('temp-cart');
    if (!storedCart) {
      console.log('📭 Không có giỏ hàng tạm trong localStorage.');
      this.cart = new Map();
      this.cartSubject.next(new Map(this.cart));
      return;
    }

    try {
      const parsedCart = JSON.parse(storedCart);
      console.log('📥 Dữ liệu giỏ hàng tạm từ localStorage:', parsedCart);

      this.cart = new Map();
      parsedCart.forEach((item: any) => {
        if (Array.isArray(item) && item.length === 2 && item[1]?.product?.idSanPham && item[1]?.volume) {
          const [productKey, value] = item;
          this.cart.set(productKey, {
            product: value.product,
            quantity: value.quantity,
            volume: String(value.volume).trim(),
          });
        } else {
          console.warn('🔴 Mục giỏ hàng không hợp lệ:', item);
        }
      });

      console.log('✅ Giỏ hàng tạm sau khi load:', Array.from(this.cart.entries()));
      this.cartSubject.next(new Map(this.cart));
    } catch (error) {
      console.error('❌ Lỗi khi parse JSON giỏ hàng tạm từ localStorage:', error);
      this.cart = new Map();
      this.cartSubject.next(new Map(this.cart));
    }
  }

  private loadCartForUser(userId: string): void {
    console.log(`🔍 Loading cart for userId ${userId} from localStorage...`);
    const storedCart = localStorage.getItem(`cart-${userId}`);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        console.log('📥 Dữ liệu giỏ hàng từ localStorage (userId):', parsedCart);

        this.cart = new Map();
        parsedCart.forEach((item: any) => {
          if (Array.isArray(item) && item.length === 2 && item[1]?.product?.idSanPham && item[1]?.volume) {
            const [productKey, value] = item;
            this.cart.set(productKey, {
              product: value.product,
              quantity: value.quantity,
              volume: String(value.volume).trim(),
            });
          } else {
            console.warn('🔴 Mục giỏ hàng không hợp lệ:', item);
          }
        });

        console.log('✅ Giỏ hàng sau khi load từ localStorage:', Array.from(this.cart.entries()));
      } catch (error) {
        console.error('❌ Lỗi khi parse JSON giỏ hàng từ localStorage:', error);
        this.cart = new Map();
      }
    } else {
      console.log('📭 Không có giỏ hàng nào trong localStorage cho userId:', userId);
      this.cart = new Map();
    }

    this.mergeTempCart(userId);
    this.updateCartInLocalStorage(userId);
    console.log('📤 Emitting updated cart via cartSubject:', Array.from(this.cart.entries()));
    this.cartSubject.next(new Map(this.cart));
  }

  private mergeTempCart(userId: string): void {
    const tempCart = localStorage.getItem('temp-cart');
    if (!tempCart) {
      console.log('📭 Không có giỏ hàng tạm để gộp.');
      return;
    }

    try {
      const parsedTempCart = JSON.parse(tempCart);
      console.log('📥 Dữ liệu giỏ hàng tạm để gộp:', parsedTempCart);

      parsedTempCart.forEach((item: any) => {
        if (Array.isArray(item) && item.length === 2 && item[1]?.product?.idSanPham && item[1]?.volume) {
          const [productKey, value] = item;
          if (this.cart.has(productKey)) {
            const existingProduct = this.cart.get(productKey);
            if (existingProduct) {
              existingProduct.quantity += value.quantity;
              this.cart.set(productKey, existingProduct);
              console.log(`🔄 Cập nhật số lượng cho sản phẩm ${productKey}:`, existingProduct.quantity);
            }
          } else {
            this.cart.set(productKey, {
              product: value.product,
              quantity: value.quantity,
              volume: String(value.volume).trim(),
            });
            console.log(`➕ Thêm sản phẩm mới ${productKey} từ temp-cart`);
          }
        } else {
          console.warn('🔴 Mục giỏ hàng tạm không hợp lệ:', item);
        }
      });

      localStorage.removeItem('temp-cart');
      this.updateCartInLocalStorage(userId);
      console.log('✅ Đã gộp giỏ hàng tạm vào giỏ hàng của userId:', userId);
    } catch (error) {
      console.error('❌ Lỗi khi gộp giỏ hàng tạm:', error);
    }
  }

  setUserId(userId: string | null): void {
    if (this.userId === userId) {
      console.log('🔄 userId không thay đổi, bỏ qua:', userId);
      return;
    }

    // Save the current cart to temp-cart if there are items and no userId is set
    if (this.cart.size > 0 && !this.userId) {
      console.log('💾 Lưu giỏ hàng hiện tại vào temp-cart trước khi đăng nhập:', Array.from(this.cart.entries()));
      localStorage.setItem('temp-cart', JSON.stringify(Array.from(this.cart.entries())));
    }

    this.userId = userId;
    console.log('👤 user đăng nhập:', userId);
    this.loadCart();
  }

  getUserId(): string | null {
    if (this.userId) {
      return this.userId;
    }

    const storedUserId = localStorage.getItem('currentUserId');
    if (storedUserId) {
      console.log('🔄 UserID khôi phục từ localStorage:', storedUserId);
      this.userId = storedUserId;
      return storedUserId;
    }

    console.warn('⚠️ Không tìm thấy userId!');
    return null;
  }

  addToCart(product: any, quantity: number = 1): void {
    if (!product || !product.idSanPham) {
      console.error('❌ Không thể thêm sản phẩm không hợp lệ vào giỏ hàng!', product);
      return;
    }

    console.log('📦 Product data:', product);
    const productKey = this.createProductKey(product.idSanPham, product.dungTich);
    console.log(`🛒 Đang thêm vào giỏ hàng - Key: ${productKey}`);

    if (this.cart.has(productKey)) {
      const existingProduct = this.cart.get(productKey);
      if (existingProduct) {
        existingProduct.quantity = (existingProduct.quantity || 0) + quantity;
        this.cart.set(productKey, existingProduct);
        console.log(`🔄 Cập nhật số lượng cho sản phẩm ${productKey}:`, existingProduct.quantity);
      } else {
        console.warn(`⚠️ Sản phẩm có key ${productKey} bị undefined!`, existingProduct);
      }
    } else {
      this.cart.set(productKey, {
        product: { ...product },
        quantity,
        volume: String(product.dungTich).trim(),
      });
      console.log(`➕ Thêm sản phẩm mới ${productKey} vào giỏ hàng`);
    }

    console.log('✅ Giỏ hàng hiện tại:', Array.from(this.cart.entries()));
    this.saveCart();
    this.cartSubject.next(new Map(this.cart));
  }

  updateCartItem(productId: number, volume: string, quantity: number): void {
    const productKey = this.createProductKey(productId, volume);
    if (this.cart.has(productKey)) {
      const item = this.cart.get(productKey);
      if (item) {
        item.quantity = quantity;
        this.cart.set(productKey, item);
        console.log(`🔄 Đã cập nhật số lượng cho sản phẩm ${productKey}:`, quantity);
        this.saveCart();
        this.cartSubject.next(new Map(this.cart));
      }
    }
  }

  removeFromCart(productKey: string): void {
    if (this.cart.has(productKey)) {
      this.cart.delete(productKey);
      console.log(`🗑️ Đã xóa sản phẩm ${productKey} khỏi giỏ hàng`);
      this.saveCart();
      this.cartSubject.next(new Map(this.cart));
    } else {
      console.warn(`⚠️ Sản phẩm ${productKey} không tồn tại trong giỏ hàng`);
    }
  }

  setSelectedCartItems(items: any[]): void {
    this.selectedCartItems = items;
    console.log('🛒 Đã đặt danh sách sản phẩm được chọn:', this.selectedCartItems);
  }

  getCart(): any[] {
    const cartItems = Array.from(this.cart.entries()).map(([key, value]) => value);
    console.log('🛒 Trả về giỏ hàng:', cartItems);
    return cartItems;
  }

  private saveCart(): void {
    const userId = this.getUserId();
    if (!userId) {
      console.log('👤 Không có user đăng nhập, lưu giỏ hàng tạm thời.');
      const cartArray = Array.from(this.cart.entries());
      console.log('💾 Đang lưu giỏ hàng tạm thời vào localStorage:', cartArray);
      localStorage.setItem('temp-cart', JSON.stringify(cartArray));
    } else {
      this.updateCartInLocalStorage(userId);
    }
  }

  private updateCartInLocalStorage(userId: string): void {
    const cartArray = Array.from(this.cart.entries()).map(([key, value]) => {
      if (!value || !value.product) {
        console.warn(`⚠️ Bỏ qua mục không hợp lệ trong giỏ hàng - Key: ${key}`, value);
        return null;
      }
      return [key, value];
    }).filter(item => item !== null);

    console.log(`💾 Đang lưu giỏ hàng vào localStorage cho userId ${userId}:`, cartArray);
    localStorage.setItem(`cart-${userId}`, JSON.stringify(cartArray));
    console.log(`✅ Giỏ hàng đã cập nhật vào localStorage cho userId ${userId}:`, cartArray);
  }

  private createProductKey(productId: number, volume: string | number): string {
    return `${productId}_${String(volume).trim()}`;
  }

  public getCartObservable() {
    return this.cartSubject.asObservable();
  }

  public reloadCart(): void {
    this.loadCart();
  }

  public clearCart(): void {
    this.cart = new Map();
    this.saveCart();
    this.cartSubject.next(new Map(this.cart));
    console.log('🗑️ Đã xóa giỏ hàng');
  }

  public clearCartOnClient(): void {
    this.cart.clear();
    this.saveCart();
    this.cartSubject.next(new Map());
    console.log('🗑️ Cart has been cleared on the client-side.');
  }
}