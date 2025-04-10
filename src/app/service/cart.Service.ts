import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TokenService } from '../service/token.service';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import Swal from 'sweetalert2';

export interface CartItem {
  product: {
    idSanPham: number;
    idSpct: number;
    tenSanPham?: string;
    donGia: number;
    dungTich: string;
    imageURL?: string;
  };
  quantity: number;
  volume: string;
}

export interface CartItemWithKey extends CartItem {
  key: string;
}

export interface BackendCartItem {
  id?: number;
  soLuong: number;
  donGia: number;
  idSpct: number;
  dungTich: string;
  tenSanPham: string;
  imageUrl: string[];
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: Map<string, CartItem> = new Map();
  private cartSubject: BehaviorSubject<Map<string, CartItem>> = new BehaviorSubject(new Map());
  private apiUrl = 'http://localhost:8080/api/cart';
  private userId: string | null = null;
  selectedCartItems: CartItemWithKey[] = [];

  constructor(
    private tokenService: TokenService,
    private http: HttpClient
  ) {
    this.loadCart();
  }

  private getUserId(): string | null {
    if (!this.userId) {
      const userId = this.tokenService.getUserId();
      this.userId = userId > 0 ? String(userId) : null;
    }
    return this.userId;
  }

  setUserId(userId: string | null): void {
    if (this.userId === userId) {
      console.log('🔄 userId không thay đổi, bỏ qua:', userId);
      return;
    }

    if (this.cart.size > 0 && !this.userId) {
      console.log('💾 Lưu giỏ hàng hiện tại vào temp-cart trước khi đăng nhập:', Array.from(this.cart.entries()));
      localStorage.setItem('temp-cart', JSON.stringify(Array.from(this.cart.entries())));
    }

    this.userId = userId;
    console.log('👤 user đăng nhập:', userId);
    this.loadCart();
  }

  private loadCart(): void {
    const userId = this.getUserId();
    console.log('🔍 Loading cart for userId:', userId);
    if (userId) {
      this.loadCartFromDB(userId);
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
      parsedCart.forEach((item: [string, CartItem]) => {
        if (Array.isArray(item) && item.length === 2 && item[1]?.product?.idSpct && item[1]?.volume) {
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
      localStorage.removeItem('temp-cart');
      this.cart = new Map();
      this.cartSubject.next(new Map(this.cart));
    }
  }

  private loadCartFromDB(userId: string): void {
    this.http.get<BackendCartItem[]>(`${this.apiUrl}/${userId}`).pipe(
      tap(cartItems => {
        this.cart = new Map<string, CartItem>();
        if (!cartItems || cartItems.length === 0) {
          console.log('📭 Giỏ hàng trống từ backend.');
        } else {
          cartItems.forEach(item => {
            if (!item || !item.idSpct || !item.dungTich) {
              console.warn('🔴 Dữ liệu giỏ hàng không hợp lệ, bỏ qua mục:', item);
              return;
            }

            const key = this.createProductKey(item.idSpct, item.dungTich);
            this.cart.set(key, {
              product: {
                idSanPham: item.idSpct,
                idSpct: item.idSpct,
                tenSanPham: item.tenSanPham,
                donGia: item.donGia,
                dungTich: item.dungTich,
                imageURL: item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl[0] : ''
              },
              quantity: item.soLuong,
              volume: String(item.dungTich)
            });
          });
          console.log('✅ Giỏ hàng từ backend:', Array.from(this.cart.entries()));
        }

        this.mergeTempCart(userId);
        this.cartSubject.next(new Map(this.cart)); // Đảm bảo cập nhật cartSubject
      }),
      catchError(err => {
        console.error('❌ Lỗi khi tải giỏ hàng từ backend:', err);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể tải giỏ hàng từ backend. Vui lòng thử lại!',
          position: 'bottom-end'
        });
        this.cart = new Map();
        this.cartSubject.next(new Map(this.cart));
        return throwError(err);
      })
    ).subscribe();
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

      if (!Array.isArray(parsedTempCart)) {
        console.warn('🔴 Dữ liệu giỏ hàng tạm không hợp lệ (không phải mảng):', parsedTempCart);
        localStorage.removeItem('temp-cart');
        return;
      }

      parsedTempCart.forEach((item: [string, CartItem]) => {
        if (Array.isArray(item) && item.length === 2 && item[1]?.product?.idSpct && item[1]?.quantity) {
          const [productKey, value] = item;
          const params = {
            idTaiKhoan: userId,
            idSpct: value.product.idSpct,
            soLuong: value.quantity
          };
          this.http.post(`${this.apiUrl}/add`, null, { params }).pipe(
            tap(() => {
              console.log(`➕ Đã gộp sản phẩm ${productKey} vào giỏ hàng backend`);
              this.loadCartFromDB(userId);
            }),
            catchError(err => {
              console.error(`❌ Lỗi khi gộp sản phẩm ${productKey}:`, err);
              return throwError(err);
            })
          ).subscribe();
        } else {
          console.warn('🔴 Mục giỏ hàng tạm không hợp lệ, bỏ qua:', item);
        }
      });

      localStorage.removeItem('temp-cart');
    } catch (error) {
      console.error('❌ Lỗi khi gộp giỏ hàng tạm:', error);
      localStorage.removeItem('temp-cart');
    }
  }

  addToCart(product: any, quantity: number = 1): void {
    if (!product || !product.idSpct || !product.dungTich) {
      console.error('❌ Không thể thêm sản phẩm không hợp lệ vào giỏ hàng!', product);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Sản phẩm không hợp lệ!',
        position: 'bottom-end'
      });
      return;
    }

    const userId = this.getUserId();
    const productKey = this.createProductKey(product.idSpct, product.dungTich);

    if (userId) {
      const params = { idTaiKhoan: userId, idSpct: product.idSpct, soLuong: quantity };
      this.http.post(`${this.apiUrl}/add`, null, { params }).pipe(
        tap(() => {
          this.loadCartFromDB(userId);
          Swal.fire({
            icon: 'success',
            title: 'Đã thêm vào giỏ hàng',
            text: `✅ ${quantity} sản phẩm đã được thêm!`,
            position: 'bottom-end',
            timer: 1500,
            showConfirmButton: false
          });
        }),
        catchError(err => {
          console.error('❌ Lỗi khi thêm vào giỏ:', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Lỗi khi thêm vào giỏ hàng',
            position: 'bottom-end'
          });
          return throwError(err);
        })
      ).subscribe();
    } else {
      if (this.cart.has(productKey)) {
        const existingProduct = this.cart.get(productKey);
        if (existingProduct) {
          existingProduct.quantity += quantity;
          this.cart.set(productKey, existingProduct);
        }
      } else {
        this.cart.set(productKey, {
          product: {
            idSanPham: product.idSanPham,
            idSpct: product.idSpct,
            tenSanPham: product.tenSanPham,
            donGia: product.donGia,
            dungTich: product.dungTich,
            imageURL: product.imageURL || ''
          },
          quantity,
          volume: String(product.dungTich).trim()
        });
      }
      this.saveCart();
      this.cartSubject.next(new Map(this.cart));
      Swal.fire({
        icon: 'success',
        title: 'Đã thêm vào giỏ hàng',
        text: `✅ ${quantity} sản phẩm đã được thêm!`,
        position: 'bottom-end',
        timer: 1500,
        showConfirmButton: false
      });
    }
  }

  updateCartItem(productId: number, volume: string, quantity: number): void {
    const userId = this.getUserId();
    const productKey = this.createProductKey(productId, volume);

    if (userId) {
      const params = { idTaiKhoan: userId, idSpct: productId, soLuong: quantity };
      this.http.put(`${this.apiUrl}/update`, null, { params }).pipe(
        tap(() => {
          this.loadCartFromDB(userId);
        }),
        catchError(err => {
          console.error('❌ Lỗi khi cập nhật giỏ:', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Lỗi khi cập nhật giỏ hàng',
            position: 'bottom-end'
          });
          return throwError(err);
        })
      ).subscribe();
    } else {
      if (this.cart.has(productKey)) {
        const item = this.cart.get(productKey);
        if (item) {
          item.quantity = quantity;
          this.cart.set(productKey, item);
          this.saveCart();
          this.cartSubject.next(new Map(this.cart));
        }
      }
    }
  }

  removeFromCart(productKey: string): void {
    const userId = this.getUserId();
    if (userId) {
      const [idSpct] = productKey.split('_');
      const params = { idTaiKhoan: userId, idSpct };
      this.http.delete(`${this.apiUrl}/remove`, { params }).pipe(
        tap(() => {
          this.cart.delete(productKey);
          this.cartSubject.next(new Map(this.cart)); // Cập nhật ngay lập tức
          this.loadCartFromDB(userId); // Đồng bộ với backend
        }),
        catchError(err => {
          console.error('❌ Lỗi khi xóa khỏi giỏ:', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Lỗi khi xóa khỏi giỏ hàng',
            position: 'bottom-end'
          });
          return throwError(err);
        })
      ).subscribe();
    } else {
      if (this.cart.has(productKey)) {
        this.cart.delete(productKey);
        this.saveCart();
        this.cartSubject.next(new Map(this.cart));
      }
    }
  }

  removeMultipleFromCart(products: { idSpct: number; volume: string }[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!products || products.length === 0) {
        console.log('📭 Không có sản phẩm nào để xóa.');
        resolve();
        return;
      }

      const userId = this.getUserId();
      if (!userId) {
        // Guest user: Remove from temp-cart
        products.forEach(product => {
          const productKey = this.createProductKey(product.idSpct, product.volume);
          if (this.cart.has(productKey)) {
            this.cart.delete(productKey);
            console.log(`🗑️ Đã xóa sản phẩm ${productKey} khỏi temp-cart`);
          }
        });
        this.saveCart();
        this.cartSubject.next(new Map(this.cart));
        resolve();
        return;
      }

      // Logged-in user: Call backend remove-multiple endpoint
      const idSpcts = products.map(p => p.idSpct).join(',');
      const params = new HttpParams()
        .set('idTaiKhoan', userId)
        .set('idSpcts', idSpcts);

      this.http.delete(`${this.apiUrl}/remove-multiple`, { params }).pipe(
        tap(() => {
          products.forEach(product => {
            const productKey = this.createProductKey(product.idSpct, product.volume);
            this.cart.delete(productKey);
            console.log(`🗑️ Đã xóa sản phẩm ${productKey} khỏi giỏ hàng`);
          });
          this.cartSubject.next(new Map(this.cart)); // Cập nhật ngay lập tức
          this.loadCartFromDB(userId); // Đồng bộ với backend
        }),
        catchError(err => {
          console.error('❌ Lỗi khi xóa nhiều sản phẩm khỏi giỏ:', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng',
            position: 'bottom-end'
          });
          return throwError(err);
        })
      ).subscribe({
        complete: () => resolve(),
        error: (err) => reject(err)
      });
    });
  }

  setSelectedCartItems(items: CartItemWithKey[]): void {
    this.selectedCartItems = items;
    console.log('🛒 Đã đặt danh sách sản phẩm được chọn:', this.selectedCartItems);
  }

  getCart(): CartItemWithKey[] {
    const cartItems = Array.from(this.cart.entries()).map(([key, value]) => ({
      key,
      ...value
    }));
    console.log('🛒 Trả về giỏ hàng:', cartItems);
    return cartItems;
  }

  getCartObservable(): Observable<Map<string, CartItem>> {
    return this.cartSubject.asObservable();
  }

  clearCart(): void {
    const userId = this.getUserId();
    if (userId) {
      this.http.delete(`${this.apiUrl}/clear/${userId}`).pipe(
        tap(() => {
          this.cart.clear();
          this.cartSubject.next(new Map(this.cart)); // Cập nhật ngay lập tức
          this.loadCartFromDB(userId); // Đồng bộ với backend
        }),
        catchError(err => {
          console.error('❌ Lỗi khi xóa giỏ:', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Lỗi khi xóa toàn bộ giỏ hàng',
            position: 'bottom-end'
          });
          return throwError(err);
        })
      ).subscribe();
    } else {
      this.cart.clear();
      this.saveCart();
      this.cartSubject.next(new Map(this.cart));
    }
  }

  clearCartOnClient(): void {
    this.cart.clear();
    this.saveCart();
    this.cartSubject.next(new Map(this.cart));
    console.log('🗑️ Cart has been cleared on the client-side.');
  }

  private saveCart(): void {
    const userId = this.getUserId();
    if (!userId) {
      const cartArray = Array.from(this.cart.entries());
      console.log('💾 Lưu giỏ hàng vào temp-cart:', cartArray);
      localStorage.setItem('temp-cart', JSON.stringify(cartArray));
    }
  }

  private createProductKey(productId: number, volume: string | number): string {
    return `${productId}_${String(volume).trim()}`;
  }

  public reloadCart(): void {
    this.loadCart();
  }


  
}



