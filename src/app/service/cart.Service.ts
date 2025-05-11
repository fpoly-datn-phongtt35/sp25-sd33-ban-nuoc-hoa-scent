import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { TokenService } from '../service/token.service';
import { WebSocketService } from '../service/WebSocketService';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import Swal from 'sweetalert2';

export interface CartItem {
  product: {
    idSanPham: number;
    idSpct: number;
    tenSanPham?: string;
    donGia: number;
    dungTich: string;
    imageURL?: string;
    soLuongTonKho?: number;
  };
  quantity: number;
  volume: string;
  isHidden?: boolean;
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
  soLuongTonKho: number;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cart: Map<string, CartItem> = new Map();
  private cartSubject: BehaviorSubject<Map<string, CartItem>> = new BehaviorSubject(new Map());
  private cartItemCountSubject: BehaviorSubject<number> = new BehaviorSubject<number>(0); // Thêm để theo dõi số lượng
  private apiUrl = 'http://localhost:8080/api/cart';
  private userId: string | null = null;
  private selectedCartItems: CartItemWithKey[] = [];
  private inventorySubscription: Subscription | undefined;

  constructor(
    private tokenService: TokenService,
    private http: HttpClient,
    private webSocketService: WebSocketService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.loadCart();
    this.setupWebSocket();
  }

  updateStock(productId: number, newStock: number): void {
    this.cart.forEach((item, key) => {
      if (item.product.idSanPham === productId) {
        item.product.soLuongTonKho = newStock;
      }
    });
    this.cartSubject.next(this.cart);
    this.updateCartItemCount(); // Cập nhật số lượng sau khi thay đổi giỏ hàng
  }

  private setupWebSocket(): void {
    const userId = this.getUserId();
    if (userId) {
      this.webSocketService.connect(Number(userId));
      this.inventorySubscription = this.webSocketService.getInventoryUpdates().subscribe({
        next: (update: { productId: number; stock: number }) => {
          this.updateStockInCart(update.productId, update.stock);
        },
        error: (error) => console.error('❌ WebSocket error in CartService:', error),
      });
    }
  }

  private updateStockInCart(productId: number, newStock: number): void {
    let updated = false;
    this.cart.forEach((item, key) => {
      if (item.product.idSpct === productId) {
        item.product.soLuongTonKho = newStock;
        this.cart.set(key, item);
        updated = true;
      }
    });
    if (updated) {
      this.cartSubject.next(new Map(this.cart));
      this.updateCartItemCount(); // Cập nhật số lượng
    }
  }

  private getUserId(): string | null {
    if (!this.userId) {
      const userId = this.tokenService.getUserId();
      this.userId = userId > 0 ? String(userId) : null;
    }
    return this.userId;
  }

  setUserId(userId: string | null): void {
    if (this.userId === userId) return;

    if (this.cart.size > 0 && !this.userId && isPlatformBrowser(this.platformId)) {
      const cartArray = Array.from(this.cart.entries());
      const dataToStore = JSON.stringify(cartArray);
      try {
        localStorage.setItem('temp-cart', dataToStore);
      } catch (e) {
        console.error('❌ Lỗi khi lưu temp-cart vào localStorage:', e);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi lưu trữ',
          text: 'Dữ liệu giỏ hàng tạm quá lớn để lưu trữ!',
          position: 'bottom-end',
        });
      }
    }

    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }
    this.webSocketService.disconnect();

    this.userId = userId;
    this.loadCart();
    this.setupWebSocket();
  }

  private loadCart(): void {
    const userId = this.getUserId();
    if (userId) {
      this.loadCartFromDB(userId);
    } else {
      this.loadTempCart();
    }
  }

  private loadTempCart(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.cart = new Map();
      this.cartSubject.next(new Map(this.cart));
      this.updateCartItemCount();
      return;
    }

    const storedCart = localStorage.getItem('temp-cart');
    if (!storedCart) {
      this.cart = new Map();
      this.cartSubject.next(new Map(this.cart));
      this.updateCartItemCount();
      return;
    }

    try {
      const parsedCart = JSON.parse(storedCart);
      this.cart = new Map();
      parsedCart.forEach((item: [string, CartItem]) => {
        if (Array.isArray(item) && item.length === 2 && item[1]?.product?.idSpct && item[1]?.volume) {
          const [productKey, value] = item;
          this.cart.set(productKey, {
            product: {
              idSanPham: value.product.idSanPham,
              idSpct: value.product.idSpct,
              tenSanPham: value.product.tenSanPham,
              donGia: value.product.donGia,
              dungTich: value.product.dungTich,
              imageURL: value.product.imageURL,
              soLuongTonKho: value.product.soLuongTonKho,
            },
            quantity: value.quantity,
            volume: String(value.volume).trim(),
          });
        }
      });
      this.cartSubject.next(new Map(this.cart));
      this.updateCartItemCount();
    } catch (error) {
      console.error('❌ Lỗi khi parse JSON giỏ hàng tạm từ localStorage:', error);
      localStorage.removeItem('temp-cart');
      this.cart = new Map();
      this.cartSubject.next(new Map(this.cart));
      this.updateCartItemCount();
    }
  }

  private loadCartFromDB(userId: string): void {
    this.http.get<BackendCartItem[]>(`${this.apiUrl}/${userId}`).pipe(
      tap(cartItems => {
        this.cart = new Map<string, CartItem>();
        if (cartItems && cartItems.length > 0) {
          cartItems.forEach(item => {
            if (item && item.idSpct && item.dungTich) {
              const key = this.createProductKey(item.idSpct, item.dungTich);
              this.cart.set(key, {
                product: {
                  idSanPham: item.idSpct,
                  idSpct: item.idSpct,
                  tenSanPham: item.tenSanPham,
                  donGia: item.donGia,
                  dungTich: item.dungTich,
                  imageURL: item.imageUrl && item.imageUrl.length > 0 ? item.imageUrl[0] : '',
                  soLuongTonKho: item.soLuongTonKho,
                },
                quantity: item.soLuong,
                volume: String(item.dungTich),
              });
            }
          });
        }
        this.mergeTempCart(userId);
        this.cartSubject.next(new Map(this.cart));
        this.updateCartItemCount();
      }),
      catchError(err => {
        console.error('❌ Lỗi khi tải giỏ hàng từ backend:', err);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể tải giỏ hàng từ backend. Vui lòng thử lại!',
          position: 'bottom-end',
        });
        this.cart = new Map();
        this.cartSubject.next(new Map(this.cart));
        this.updateCartItemCount();
        return throwError(err);
      })
    ).subscribe();
  }

  private mergeTempCart(userId: string): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const tempCart = localStorage.getItem('temp-cart');
    if (!tempCart) return;

    try {
      const parsedTempCart = JSON.parse(tempCart);
      if (!Array.isArray(parsedTempCart)) {
        localStorage.removeItem('temp-cart');
        return;
      }

      const itemsToAdd = parsedTempCart
        .filter((item: [string, CartItem]) => Array.isArray(item) && item.length === 2 && item[1]?.product?.idSpct && item[1]?.quantity)
        .map((item: [string, CartItem]) => ({
          idTaiKhoan: userId,
          idSpct: item[1].product.idSpct,
          soLuong: item[1].quantity,
        }));

      if (itemsToAdd.length > 0) {
        this.http.post(`${this.apiUrl}/add-multiple`, itemsToAdd).pipe(
          tap(() => {
            this.loadCartFromDB(userId);
          }),
          catchError(err => {
            console.error('❌ Lỗi khi gộp giỏ hàng tạm:', err);
            return throwError(err);
          })
        ).subscribe();
      }

      localStorage.removeItem('temp-cart');
    } catch (error) {
      console.error('❌ Lỗi khi gộp giỏ hàng tạm:', error);
      localStorage.removeItem('temp-cart');
    }
  }

  addToCart(product: any, quantity: number = 1): void {
    if (!product || !product.idSpct || !product.dungTich) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Sản phẩm không hợp lệ!',
        position: 'bottom-end',
      });
      return;
    }

    if (product.soLuongTonKho !== undefined && product.soLuongTonKho < quantity) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Số lượng tồn kho không đủ! Chỉ còn ${product.soLuongTonKho} sản phẩm.`,
        position: 'bottom-end',
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
            showConfirmButton: false,
          });
        }),
        catchError(err => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Lỗi khi thêm vào giỏ hàng',
            position: 'bottom-end',
          });
          return throwError(err);
        })
      ).subscribe();
    } else {
      this.addToLocalCart(product, quantity, productKey);
    }
  }

  private addToLocalCart(product: any, quantity: number, productKey: string) {
    if (this.cart.has(productKey)) {
      const existingProduct = this.cart.get(productKey);
      if (existingProduct) {
        const newQuantity = existingProduct.quantity + quantity;
        if (product.soLuongTonKho !== undefined && newQuantity > product.soLuongTonKho) {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: `Số lượng tồn kho không đủ! Chỉ còn ${product.soLuongTonKho} sản phẩm.`,
            position: 'bottom-end',
          });
          return;
        }
        existingProduct.quantity = newQuantity;
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
          imageURL: product.imageURL || '',
          soLuongTonKho: product.soLuongTonKho,
        },
        quantity,
        volume: String(product.dungTich).trim(),
      });
    }
    this.saveCart();
    this.cartSubject.next(new Map(this.cart));
    this.updateCartItemCount(); // Cập nhật số lượng
    Swal.fire({
      icon: 'success',
      title: 'Đã thêm vào giỏ hàng',
      text: `✅ ${quantity} sản phẩm đã được thêm!`,
      position: 'bottom-end',
      timer: 1500,
      showConfirmButton: false,
    });
  }

  updateCartItem(productId: number, volume: string, quantity: number): void {
    const userId = this.getUserId();
    const productKey = this.createProductKey(productId, volume);

    if (userId) {
      const params = { idTaiKhoan: userId, idSpct: productId, soLuong: quantity };
      this.http.put<{ message: string }>(`${this.apiUrl}/update`, null, { params }).pipe(
        tap(() => {
          this.loadCartFromDB(userId);
        }),
        catchError(err => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Lỗi khi cập nhật giỏ hàng',
            position: 'bottom-end',
          });
          this.loadCartFromDB(userId);
          return throwError(err);
        })
      ).subscribe();
    } else {
      if (this.cart.has(productKey)) {
        const item = this.cart.get(productKey);
        if (item) {
          if (item.product.soLuongTonKho !== undefined && quantity > item.product.soLuongTonKho) {
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: `Số lượng tồn kho không đủ! Chỉ còn ${item.product.soLuongTonKho} sản phẩm.`,
              position: 'bottom-end',
            });
            return;
          }
          item.quantity = quantity;
          this.cart.set(productKey, item);
          this.saveCart();
          this.cartSubject.next(new Map(this.cart));
          this.updateCartItemCount();
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
          this.cartSubject.next(new Map(this.cart));
          this.loadCartFromDB(userId);
        }),
        catchError(err => {
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
        this.updateCartItemCount();
      }
    }
  }

  removeMultipleFromCart(products: { idSpct: number; volume: string }[]): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!products || products.length === 0) {
        resolve();
        return;
      }

      const userId = this.getUserId();
      if (!userId) {
        products.forEach(product => {
          const productKey = this.createProductKey(product.idSpct, product.volume);
          this.cart.delete(productKey);
        });
        this.saveCart();
        this.cartSubject.next(new Map(this.cart));
        this.updateCartItemCount();
        resolve();
        return;
      }

      const idSpcts = products.map(p => p.idSpct).join(',');
      const params = new HttpParams()
        .set('idTaiKhoan', userId)
        .set('idSpcts', idSpcts);

      this.http.delete(`${this.apiUrl}/remove-multiple`, { params }).pipe(
        tap(() => {
          products.forEach(product => {
            const productKey = this.createProductKey(product.idSpct, product.volume);
            this.cart.delete(productKey);
          });
          this.cartSubject.next(new Map(this.cart));
          this.loadCartFromDB(userId);
        }),
        catchError(err => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Không thể xóa sản phẩm khỏi giỏ hàng',
            position: 'bottom-end',
          });
          return throwError(err);
        })
      ).subscribe({
        complete: () => resolve(),
        error: (err) => reject(err),
      });
    });
  }

  setSelectedCartItems(items: CartItemWithKey[]): void {
    this.selectedCartItems = items;
  }

  getSelectedCartItems(): CartItemWithKey[] {
    return this.selectedCartItems;
  }

  getCart(): CartItemWithKey[] {
    return Array.from(this.cart.entries()).map(([key, value]) => ({
      key,
      ...value,
    }));
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
          this.cartSubject.next(new Map(this.cart));
          this.loadCartFromDB(userId);
        }),
        catchError(err => {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: err.error?.message || 'Lỗi khi xóa toàn bộ giỏ hàng',
            position: 'bottom-end',
          });
          return throwError(err);
        })
      ).subscribe();
    } else {
      this.cart.clear();
      this.saveCart();
      this.cartSubject.next(new Map(this.cart));
      this.updateCartItemCount();
    }
  }

  clearCartOnClient(): void {
    this.cart.clear();
    this.saveCart();
    this.cartSubject.next(new Map(this.cart));
    this.updateCartItemCount();
  }

  private saveCart(): void {
    const userId = this.getUserId();
    if (!userId && isPlatformBrowser(this.platformId)) {
      const cartArray = Array.from(this.cart.entries());
      const dataToStore = JSON.stringify(cartArray);
      try {
        localStorage.setItem('temp-cart', dataToStore);
      } catch (e) {
        console.error('❌ Lỗi khi lưu temp-cart vào localStorage:', e);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi lưu trữ',
          text: 'Dữ liệu giỏ hàng tạm quá lớn để lưu trữ!',
          position: 'bottom-end',
        });
      }
    }
  }

  private createProductKey(productId: number, volume: string | number): string {
    return `${productId}_${String(volume).trim()}`;
  }

  public reloadCart(): void {
    this.loadCart();
  }

  // Thêm phương thức để tính tổng số lượng sản phẩm
  private updateCartItemCount(): void {
    const totalQuantity = Array.from(this.cart.values()).reduce((sum, item) => sum + item.quantity, 0);
    this.cartItemCountSubject.next(totalQuantity);
  }

  getCartItemCount(): Observable<number> {
    return this.cartItemCountSubject.asObservable();
  }

  getCartItemCountValue(): number {
    return Array.from(this.cart.values()).reduce((sum, item) => sum + item.quantity, 0);
  }
}