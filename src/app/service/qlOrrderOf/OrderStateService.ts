// order-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderStateService {
  private state: any = {
    orders: [
      {
        donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
        chiTietDonHangs: [],
        phuongThucThanhToan: 'tm',
        maGiamGia: null,
        completed: false,
      },
    ],
    currentOrderIndex: 0,
    discountCodeInput: '',
    discountDetails: null,
    discountAmount: 0,
    discountMessage: null,
    totalBeforeDiscount: 0,
    totalAfterDiscount: undefined,
    searchKeyword: '',
    filterTenNhomHuong: '',
    filterTenDanhMuc: '',
    filterTenThuongHieu: '',
    errorMessage: '',
    isLoading: false,
    showQuantityModal: false,
    selectedProduct: null,
    selectedQuantity: 1,
    vietQRString: null,
    finalAmount: 0,
  };

  private stateSubject = new BehaviorSubject<any>(this.state);
  private sessionId: string;

  constructor() {
    // Khởi tạo sessionId
    this.sessionId = localStorage.getItem('sessionId') || this.generateSessionId();
    localStorage.setItem('sessionId', this.sessionId);

    // Khôi phục trạng thái từ localStorage nếu có
    this.restoreStateFromLocalStorage();
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  private isLocalStorageAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  private saveStateToLocalStorage(): void {
    if (!this.isLocalStorageAvailable()) {
      console.warn('localStorage không khả dụng.');
      return;
    }

    try {
      localStorage.setItem(`offlineOrders_${this.sessionId}`, JSON.stringify(this.state.orders));
      localStorage.setItem(`currentOrderIndex_${this.sessionId}`, this.state.currentOrderIndex.toString());
      localStorage.setItem(`discountCodeInput_${this.sessionId}`, this.state.discountCodeInput);
      localStorage.setItem(`discountDetails_${this.sessionId}`, JSON.stringify(this.state.discountDetails));
      localStorage.setItem(`discountAmount_${this.sessionId}`, this.state.discountAmount.toString());
      localStorage.setItem(`discountMessage_${this.sessionId}`, this.state.discountMessage || '');
      localStorage.setItem(`totalBeforeDiscount_${this.sessionId}`, this.state.totalBeforeDiscount.toString());
      localStorage.setItem(`totalAfterDiscount_${this.sessionId}`, this.state.totalAfterDiscount?.toString() || '');
      localStorage.setItem(`searchKeyword_${this.sessionId}`, this.state.searchKeyword);
      localStorage.setItem(`filterTenNhomHuong_${this.sessionId}`, this.state.filterTenNhomHuong);
      localStorage.setItem(`filterTenDanhMuc_${this.sessionId}`, this.state.filterTenDanhMuc);
      localStorage.setItem(`filterTenThuongHieu_${this.sessionId}`, this.state.filterTenThuongHieu);
      localStorage.setItem(`errorMessage_${this.sessionId}`, this.state.errorMessage || '');
      localStorage.setItem(`isLoading_${this.sessionId}`, this.state.isLoading.toString());
      localStorage.setItem(`showQuantityModal_${this.sessionId}`, this.state.showQuantityModal.toString());
      localStorage.setItem(`selectedProduct_${this.sessionId}`, JSON.stringify(this.state.selectedProduct));
      localStorage.setItem(`selectedQuantity_${this.sessionId}`, this.state.selectedQuantity.toString());
      localStorage.setItem(`vietQRString_${this.sessionId}`, this.state.vietQRString || '');
      localStorage.setItem(`finalAmount_${this.sessionId}`, this.state.finalAmount.toString());
    } catch (error) {
      console.error('Lỗi khi lưu vào localStorage:', error);
      localStorage.removeItem(`offlineOrders_${this.sessionId}`);
      this.resetState();
    }
  }

  private restoreStateFromLocalStorage(): void {
    if (!this.isLocalStorageAvailable()) {
      return;
    }

    try {
      const savedOrders = localStorage.getItem(`offlineOrders_${this.sessionId}`);
      if (savedOrders) {
        this.state.orders = JSON.parse(savedOrders);
        this.state.orders = this.state.orders.map((order: any) => ({
          ...order,
          completed: order.completed ?? false,
          chiTietDonHangs: order.chiTietDonHangs ?? [],
        }));
      }

      this.state.currentOrderIndex = localStorage.getItem(`currentOrderIndex_${this.sessionId}`)
        ? Number(localStorage.getItem(`currentOrderIndex_${this.sessionId}`))
        : 0;
      this.state.discountCodeInput = localStorage.getItem(`discountCodeInput_${this.sessionId}`) || '';
      this.state.discountDetails = localStorage.getItem(`discountDetails_${this.sessionId}`)
        ? JSON.parse(localStorage.getItem(`discountDetails_${this.sessionId}`)!)
        : null;
      this.state.discountAmount = Number(localStorage.getItem(`discountAmount_${this.sessionId}`)) || 0;
      this.state.discountMessage = localStorage.getItem(`discountMessage_${this.sessionId}`) || null;
      this.state.totalBeforeDiscount = Number(localStorage.getItem(`totalBeforeDiscount_${this.sessionId}`)) || 0;
      this.state.totalAfterDiscount = localStorage.getItem(`totalAfterDiscount_${this.sessionId}`)
        ? Number(localStorage.getItem(`totalAfterDiscount_${this.sessionId}`))
        : undefined;
      this.state.searchKeyword = localStorage.getItem(`searchKeyword_${this.sessionId}`) || '';
      this.state.filterTenNhomHuong = localStorage.getItem(`filterTenNhomHuong_${this.sessionId}`) || '';
      this.state.filterTenDanhMuc = localStorage.getItem(`filterTenDanhMuc_${this.sessionId}`) || '';
      this.state.filterTenThuongHieu = localStorage.getItem(`filterTenThuongHieu_${this.sessionId}`) || '';
      this.state.errorMessage = localStorage.getItem(`errorMessage_${this.sessionId}`) || null;
      this.state.isLoading = localStorage.getItem(`isLoading_${this.sessionId}`) === 'true';
      this.state.showQuantityModal = localStorage.getItem(`showQuantityModal_${this.sessionId}`) === 'true';
      this.state.selectedProduct = localStorage.getItem(`selectedProduct_${this.sessionId}`)
        ? JSON.parse(localStorage.getItem(`selectedProduct_${this.sessionId}`)!)
        : null;
      this.state.selectedQuantity = Number(localStorage.getItem(`selectedQuantity_${this.sessionId}`)) || 1;
      this.state.vietQRString = localStorage.getItem(`vietQRString_${this.sessionId}`) || null;
      this.state.finalAmount = Number(localStorage.getItem(`finalAmount_${this.sessionId}`)) || 0;

      this.stateSubject.next(this.state);
    } catch (error) {
      console.error('Lỗi khi khôi phục trạng thái từ localStorage:', error);
      this.resetState();
    }
  }

  private resetState(): void {
    this.state = {
      orders: [
        {
          donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
          chiTietDonHangs: [],
          phuongThucThanhToan: 'tm',
          maGiamGia: null,
          completed: false,
        },
      ],
      currentOrderIndex: 0,
      discountCodeInput: '',
      discountDetails: null,
      discountAmount: 0,
      discountMessage: null,
      totalBeforeDiscount: 0,
      totalAfterDiscount: undefined,
      searchKeyword: '',
      filterTenNhomHuong: '',
      filterTenDanhMuc: '',
      filterTenThuongHieu: '',
      errorMessage: null,
      isLoading: false,
      showQuantityModal: false,
      selectedProduct: null,
      selectedQuantity: 1,
      vietQRString: null,
      finalAmount: 0,
    };
    this.stateSubject.next(this.state);
    this.saveStateToLocalStorage();
  }

  getState(): Observable<any> {
    return this.stateSubject.asObservable();
  }

  updateState(newState: Partial<any>): void {
    this.state = { ...this.state, ...newState };
    // Đảm bảo errorMessage không bị undefined
    if (this.state.errorMessage === undefined || this.state.errorMessage === null) {
      this.state.errorMessage = '';
    }
    this.stateSubject.next(this.state);
    this.saveStateToLocalStorage();
  }

  clearState(): void {
    this.resetState();
  }
}