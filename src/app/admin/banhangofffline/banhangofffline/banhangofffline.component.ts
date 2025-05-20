import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef, EventEmitter } from '@angular/core';
import Swal from 'sweetalert2';
import { TokenService } from '../../../service/token.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { OrderOffService } from '../../../service/OrderOffService';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HoadonOfComponent } from '../../../hoadon-of/hoadon-of.component';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Router } from '@angular/router';
import { HomeAdminComponent } from '../../home-admin/home-admin.component';
import { VietQRService } from '../../../service/VietQR.Service';
import { ProductCacheService } from '../../../service/productCacheService';
import { Subscription, interval, debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { OrderStateService } from '../../../service/qlOrrderOf/OrderStateService';
import { WebSocketService } from '../../../service/WebSocketService';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-banhangoffline',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './banhangofffline.component.html',
  styleUrls: ['./banhangofffline.component.scss'],
})
export class OfflineOrderComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  currentOrderIndex: number = 0;
  orderId: number | null = null;
  vietQRString: string | null = null;
  finalAmount: number = 0;

  nhomHuongList: string[] = [];
  danhMucList: string[] = [];
  thuongHieuList: string[] = [];

  allProducts: any[] = [];
  products: any[] = [];
  searchKeyword: string = '';
  filterTenNhomHuong: string = '';
  filterTenDanhMuc: string = '';
  filterTenThuongHieu: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  showQuantityModal: boolean = false;
  selectedProduct: any = null;
  selectedQuantity: number = 1;

  totalBeforeDiscount: number = 0;
  totalAfterDiscount: number | undefined;
  discountCodeInput: string = '';
  discountMessage: string | null = null;
  discountAmount: number = 0;
  private discountDetails: any = null;
  orderStatusUpdated = new EventEmitter<void>();
  @Input() isComponentSwitched: boolean = false;

  // Biến để quản lý gợi ý số điện thoại
  showSuggestions: boolean = false;
  suggestions: any[] = [];
  private sdtInputSubject = new Subject<string>(); // Để debounce input

  private stateSubscription: Subscription;
  private spctUpdateSubscription: Subscription;
  private productUpdateSubscription: Subscription;
  private connectionCheckSubscription: Subscription;

  get currentOrder() {
    return this.orders[this.currentOrderIndex];
  }

  constructor(
    private orderoffservice: OrderOffService,
    private tokenService: TokenService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private homeAdminComponent: HomeAdminComponent,
    private vietQRService: VietQRService,
    private productCacheService: ProductCacheService,
    private orderStateService: OrderStateService,
    private webSocketService: WebSocketService,
    private http: HttpClient, // Inject HttpClient để gọi API
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.stateSubscription = this.orderStateService.getState().subscribe(state => {
      this.orders = state.orders;
      this.currentOrderIndex = state.currentOrderIndex;
      this.discountCodeInput = state.discountCodeInput;
      this.discountDetails = state.discountDetails;
      this.discountAmount = state.discountAmount;
      this.discountMessage = state.discountMessage;
      this.totalBeforeDiscount = state.totalBeforeDiscount;
      this.totalAfterDiscount = state.totalAfterDiscount;
      this.searchKeyword = state.searchKeyword;
      this.filterTenNhomHuong = state.filterTenNhomHuong;
      this.filterTenDanhMuc = state.filterTenDanhMuc;
      this.filterTenThuongHieu = state.filterTenThuongHieu;
      this.errorMessage = state.errorMessage ?? '';
      this.isLoading = state.isLoading;
      this.showQuantityModal = state.showQuantityModal;
      this.selectedProduct = state.selectedProduct;
      this.selectedQuantity = state.selectedQuantity;
      this.vietQRString = state.vietQRString;
      this.finalAmount = state.finalAmount;
      this.cdr.detectChanges();
    });

    // Debounce input số điện thoại để tránh gọi API quá nhiều
    this.sdtInputSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(sdt => {
        if (sdt && sdt.length >= 3) { // Chỉ tìm kiếm khi nhập ít nhất 3 ký tự
          this.searchTaiKhoanBySdt(sdt);
        } else {
          this.suggestions = []
          this.showSuggestions = false;
        }
      });
  }

  ngOnInit(): void {
    try {
      if (!this.tokenService.isLoggedIn()) {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Bạn cần đăng nhập để sử dụng chức năng này!',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/login']);
        });
        return;
      }

      const userInfo = this.tokenService.getUserInfo();
      console.log('Thông tin người dùng:', userInfo);

      const userId = userInfo.UserID;
      this.webSocketService.connect(userId);

      this.spctUpdateSubscription = this.webSocketService.getSpctUpdates().subscribe(
        (update: any) => {
          console.log('Received Spct update via WebSocket:', update);
          this.handleSpctUpdate(update);
        },
        (error) => {
          console.error('Error in Spct update subscription:', error);
          this.loadAllProducts();
        }
      );

      this.productUpdateSubscription = this.webSocketService.getProductUpdates().subscribe(
        (update: any) => {
          console.log('Received Product update via WebSocket:', update);
          this.handleProductUpdate(update);
        },
        (error) => {
          console.error('Error in Product update subscription:', error);
          this.loadAllProducts();
        }
      );

      this.connectionCheckSubscription = interval(30000).subscribe(() => {
        if (!this.webSocketService.isWebSocketConnected()) {
          console.log('WebSocket disconnected, refreshing product list...');
          this.loadAllProducts();
        }
      });

      this.loadAllProducts();

      if (!this.currentOrder.chiTietDonHangs) {
        this.currentOrder.chiTietDonHangs = [];
      }

      console.log('Phương thức thanh toán sau khi khôi phục:', this.currentOrder.phuongThucThanhToan);

      if (this.currentOrder.chiTietDonHangs.length > 0) {
        this.calculateTotal();
      }
    } catch (error) {
      console.error('Lỗi trong ngOnInit:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra khi khởi tạo. Vui lòng thử lại!',
      });
    }
  }
  cancelDiscount(): void {
    if (this.isLoading) return;
  
    this.currentOrder.maGiamGia = null;
    this.discountCodeInput = '';
    this.discountAmount = 0;
    this.totalAfterDiscount = this.totalBeforeDiscount;
    this.discountDetails = null;
    this.discountMessage = 'Đã hủy áp dụng mã giảm giá!';
  
    this.orderStateService.updateState({
      orders: this.orders,
      discountCodeInput: this.discountCodeInput,
      discountMessage: this.discountMessage,
      totalAfterDiscount: this.totalAfterDiscount,
      discountAmount: this.discountAmount,
      discountDetails: this.discountDetails,
    });
  
    Swal.fire({
      icon: 'info',
      title: 'Hủy mã giảm giá',
      text: 'Mã giảm giá đã được hủy thành công.',
      timer: 1500,
      showConfirmButton: false,
    });
  
    this.cdr.detectChanges();
  }
  ngOnDestroy(): void {
    if (this.stateSubscription) {
      this.stateSubscription.unsubscribe();
    }
    if (this.spctUpdateSubscription) {
      this.spctUpdateSubscription.unsubscribe();
    }
    if (this.productUpdateSubscription) {
      this.productUpdateSubscription.unsubscribe();
    }
    if (this.connectionCheckSubscription) {
      this.connectionCheckSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  // Hàm gọi API để tìm kiếm tài khoản theo số điện thoại
  searchTaiKhoanBySdt(sdt: string): void {
    this.http.get<any[]>(`http://localhost:8080/rest/tai-khoan/search-by-sdt?sdt=${sdt}`).subscribe(
      (response) => {
        this.suggestions = response || [];
        this.showSuggestions = this.suggestions.length > 0;
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Lỗi khi tìm kiếm tài khoản:', error);
        this.suggestions = [];
        this.showSuggestions = false;
        this.cdr.detectChanges();
      }
    );
  }

  // Hàm xử lý khi người dùng nhập số điện thoại
  onSdtInput(sdt: string): void {
    this.updateCustomerInfo('sdtNguoiNhan', sdt);
    this.sdtInputSubject.next(sdt);
  }

  // Hàm chọn một gợi ý từ danh sách
  selectSuggestion(suggestion: any): void {
    this.currentOrder.donHang.sdtNguoiNhan = suggestion.sdt;
    this.currentOrder.donHang.tenNguoiNhanHang = suggestion.hoTen;
    this.orderStateService.updateState({ orders: this.orders });
    this.suggestions = [];
    this.showSuggestions = false;
    this.cdr.detectChanges();
  }

  // Hàm ẩn danh sách gợi ý khi mất focus
  hideSuggestions(): void {
    setTimeout(() => {
      this.showSuggestions = false;
      this.cdr.detectChanges();
    }, 200);
  }

  // Các phương thức khác (giữ nguyên)
  refreshProducts(): void {
   
    this.loadAllProducts();
  }

  private handleSpctUpdate(update: any): void {
    const spctId = update.idSpct;
    const newTrangThai = update.trangThai;

    if (!spctId || newTrangThai === undefined) {
    
      return;
    }

  console.log(`Updating Spct ID: ${spctId} to trangThai: ${newTrangThai}`);

    this.allProducts = this.allProducts.map(product => {
      if (product.idSpct === spctId) {
       
        return { ...product, trangThai: newTrangThai };
      }
      return product;
    });

    this.productCacheService.setAllProducts([...this.allProducts]);

    this.currentOrder.chiTietDonHangs = this.currentOrder.chiTietDonHangs.filter((item: any) => {
      const product = this.allProducts.find(p => p.idSpct === item.idSpct);
      return product && product.trangThai === 1;
    });

    this.orderStateService.updateState({ orders: this.orders });

    this.calculateTotal();
    this.reapplyDiscountIfExists();

    this.filterProducts();

    this.cdr.detectChanges();

    const statusText = newTrangThai === 1 ? 'Đang bán' : 'Ngừng bán';
  
  }

  private handleProductUpdate(update: any): void {
    
    const productId = update.id;
    const newTrangThai = update.trangThai;

    if (!productId || newTrangThai === undefined) {
      
      return;
    }

  

    this.allProducts = this.allProducts.map(product => {
      if (product.idSanPham === productId) {
       
        return { ...product, trangThai: newTrangThai };
      }
      return product;
    });

    this.productCacheService.setAllProducts([...this.allProducts]);

    this.currentOrder.chiTietDonHangs = this.currentOrder.chiTietDonHangs.filter((item: any) => {
      const product = this.allProducts.find(p => p.idSpct === item.idSpct);
      return product && product.trangThai === 1;
    });

    this.orderStateService.updateState({ orders: this.orders });
    this.calculateTotal();
    this.reapplyDiscountIfExists();

    this.filterProducts();
    this.cdr.detectChanges();

    const statusText = newTrangThai === 1 ? 'Đang bán' : 'Ngừng bán';
   
  }

  trackByProduct(index: number, product: any): number {
    return product.idSpct;
  }

  trackByCartItem(index: number, item: any): string {
    return `${item.idSanPham}-${item.dungTich}`;
  }

  onDiscountCodeChange(value: string): void {
    this.orderStateService.updateState({ discountCodeInput: value });
  }

  updateCustomerInfo(field: 'tenNguoiNhanHang' | 'sdtNguoiNhan', value: string): void {
    this.currentOrder.donHang[field] = value;
    this.orderStateService.updateState({ orders: this.orders });
  }

  async generateVietQRString(orderId: string, amount: number, orderInfo: string): Promise<string> {
    const vietQRData = {
      accountNo: '0855616615',
      accountName: 'Lại Văn Quang',
      acqId: '970422',
      addInfo: orderInfo,
      amount: amount.toString(),
      template: 'compact',
    };

    return new Promise((resolve, reject) => {
      this.vietQRService.generateQRCode(vietQRData).subscribe({
        next: (response: any) => {
          
          if (response && response.code === '00' && response.data && response.data.qrDataURL) {
            resolve(response.data.qrDataURL);
          } else {
            reject(new Error(`Không nhận được qrDataURL từ API VietQR. Response: ${JSON.stringify(response)}`));
          }
        },
        error: (err) => {
          console.error('Lỗi khi gọi API VietQR:', err);
          reject(new Error(`Lỗi khi gọi API VietQR: ${err.message || JSON.stringify(err)}`));
        },
      });
    });
  }

  async submitOrder(): Promise<void> {
    if (!this.validateOrder()) {
      return;
    }

    this.orderStateService.updateState({ isLoading: true });

    const userId = this.tokenService.getUserInfo();
    if (!userId || !userId.UserID || isNaN(userId.UserID) || userId.UserID <= 0) {
      this.orderStateService.updateState({ isLoading: false });
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'ID tài khoản không hợp lệ! Vui lòng đăng nhập lại.',
      });
      return;
    }

    const orderRequest = {
      userId: Number(userId.UserID),
      tenNguoiNhanHang: this.currentOrder.donHang.tenNguoiNhanHang || '',
      sdtNguoiNhan: this.currentOrder.donHang.sdtNguoiNhan || '',
      chiTietDonHangs: this.currentOrder.chiTietDonHangs.map((item: any) => ({
        spctId: item.idSpct,
        quantity: item.soLuong,
      })),
      maGiamGia: this.currentOrder.maGiamGia,
      phuongThucThanhToan: this.currentOrder.phuongThucThanhToan,
      ghiChu: null,
    };

    this.orderoffservice.createOrder(orderRequest).subscribe(
      async (response) => {
        this.orderStateService.updateState({ isLoading: false });
        this.orderId = response.orderId;
        this.orderStateService.updateState({
          totalAfterDiscount: response.tongTien,
          finalAmount: response.tongTien,
        });

        const orderData = {
          orderId: this.orderId,
          tenNguoiNhanHang: this.currentOrder.donHang.tenNguoiNhanHang,
          sdtNguoiNhan: this.currentOrder.donHang.sdtNguoiNhan,
          chiTietDonHangs: [...this.currentOrder.chiTietDonHangs],
          phuongThucThanhToan: this.currentOrder.phuongThucThanhToan === 'tm' ? 'Tiền mặt' :
                               this.currentOrder.phuongThucThanhToan === 'ck' ? 'Chuyển khoản' : 'VietQR',
          total: this.totalAfterDiscount,
          ngayTao: new Date().toLocaleString(),
        };

        if (this.currentOrder.phuongThucThanhToan === 'ck') {
          const orderIdString = `ORDER_${this.orderId}`;
          const orderInfo = `Thanh toán đơn hàng ${this.orderId} từ SCENT`;

          try {
            const vietQRString = await this.generateVietQRString(orderIdString, this.finalAmount, orderInfo);
            this.orderStateService.updateState({ vietQRString });

            if (!vietQRString) {
              throw new Error('Không nhận được dữ liệu mã QR từ API VietQR');
            }

            const result = await Swal.fire({
              title: 'Quét mã QR để thanh toán',
              html: `
                <p>Số tiền: ${this.finalAmount.toLocaleString()} VNĐ</p>
                <p>Nội dung: ${orderInfo}</p>
                <img src="${vietQRString}" alt="QR Code" width="200" height="200" />
                <p>Vui lòng quét mã QR để thanh toán. Sau khi thanh toán xong, nhấn "Xác nhận" để tiếp tục.</p>
              `,
              confirmButtonText: 'Xác nhận',
              showCancelButton: true,
              cancelButtonText: 'Hủy',
            });

            if (result.isConfirmed) {
              this.finalizeOrder(orderData);
            } else {
              this.orderStateService.updateState({
                vietQRString: null,
                isLoading: false
              });
              Swal.fire({
                icon: 'info',
                title: 'Đã hủy',
                text: 'Thao tác thanh toán đã bị hủy. Đơn hàng vẫn được giữ nguyên.',
                timer: 1500,
                showConfirmButton: false,
              });
            }
          } catch (error) {
            this.orderStateService.updateState({
              vietQRString: null,
              isLoading: false
            });
            Swal.fire({
              title: 'Lỗi',
              text: `Không thể tạo mã QR. Vui lòng thử lại sau! ${error.message || ''}`,
              icon: 'error',
              confirmButtonText: 'OK',
            });
          }
        } else {
          this.finalizeOrder(orderData);
        }
      },
      (error) => {
        this.orderStateService.updateState({ isLoading: false });
        console.error('Lỗi khi tạo đơn hàng:', error);
        let errorMessage = 'Không thể tạo đơn hàng. Vui lòng thử lại sau!';
        if (error.status === 401) {
          errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!';
        } else if (error.status === 400) {
          errorMessage = error.error.message || 'Dữ liệu không hợp lệ!';
        }
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: errorMessage,
        });
      }
    );
  }

  private finalizeOrder(orderData: any): void {
    this.generatePDF(orderData);

    this.orderoffservice.updateOrderStatus(this.orderId!, {
      trangThai: 4,
      lyDoHuy: null,
    }).subscribe(
      (updateResponse) => {
        console.log('Cập nhật trạng thái thành công:', updateResponse);
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: 'Đơn hàng thành công và hóa đơn đã được in!',
          timer: 1500,
          showConfirmButton: false,
        });

        this.resetCurrentOrder();
        this.orderStatusUpdated.emit();
      },
      (error) => {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể cập nhật trạng thái đơn hàng!',
        });
      }
    );
  }

  loadAllProducts(): void {
    if (!this.webSocketService.isWebSocketConnected()) {
      this.productCacheService.clearCache();
    }

    const cachedAllProducts = this.productCacheService.getAllProducts();
    if (cachedAllProducts.length > 0 && this.webSocketService.isWebSocketConnected()) {
      console.log('Loading products from cache:', cachedAllProducts);
      this.allProducts = cachedAllProducts;
      this.products = this.productCacheService.getProducts();
      this.updateFilterLists();
      this.filterProducts();
      return;
    }

    this.orderStateService.updateState({ isLoading: true, errorMessage: null });

    this.orderoffservice.searchSanPham('').subscribe(
      (data) => {
        console.log('Products loaded from API:', data);
        this.allProducts = data || [];
        if (this.allProducts.length === 0) {
          console.warn('No products returned from API.');
          this.orderStateService.updateState({
            errorMessage: 'Không có sản phẩm nào khả dụng. Vui lòng kiểm tra lại dữ liệu!',
            isLoading: false,
          });
        } else {
          this.productCacheService.setAllProducts([...this.allProducts]);
          this.products = [...this.allProducts];
          this.updateFilterLists();
          this.filterProducts();
          this.orderStateService.updateState({ isLoading: false });
        }
      },
      (error) => {
        console.error('Lỗi khi tải sản phẩm:', error);
        this.orderStateService.updateState({
          errorMessage: 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.',
          isLoading: false,
        });
        this.allProducts = [];
        this.products = [];
        this.nhomHuongList = [];
        this.danhMucList = [];
        this.thuongHieuList = [];
        this.productCacheService.setAllProducts([]);
        this.productCacheService.setProducts([]);
      }
    );
  }

  private updateFilterLists(): void {
    this.nhomHuongList = [
      ...new Set(
        this.allProducts
          .map(product => product?.tenNhomHuong)
          .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
      ),
    ].sort();
    this.danhMucList = [
      ...new Set(
        this.allProducts
          .map(product => product?.tenDanhMuc)
          .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
      ),
    ].sort();
    this.thuongHieuList = [
      ...new Set(
        this.allProducts
          .map(product => product?.tenThuongHieu)
          .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
      ),
    ].sort();

 
  }

  filterProducts(): void {
    let filteredProducts = [...this.allProducts];

    if (this.searchKeyword) {
      const keywordLower = this.searchKeyword.toLowerCase();
      filteredProducts = filteredProducts.filter(product => {
        const matchesText =
          (product.tenSanPham?.toLowerCase()?.includes(keywordLower) ?? false) ||
          (product.tenDanhMuc?.toLowerCase()?.includes(keywordLower) ?? false) ||
          (product.tenThuongHieu?.toLowerCase()?.includes(keywordLower) ?? false) ||
          (product.tenNhomHuong?.toLowerCase()?.includes(keywordLower) ?? false);

        const matchesId =
          (product.idSanPham?.toString().includes(this.searchKeyword) ?? false) ||
          (product.idSpct?.toString().includes(this.searchKeyword) ?? false);

        return matchesText || matchesId;
      });
    }

    if (this.filterTenNhomHuong) {
      const filterLower = this.filterTenNhomHuong.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.tenNhomHuong?.toLowerCase() === filterLower
      );
    }

    if (this.filterTenDanhMuc) {
      const filterLower = this.filterTenDanhMuc.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.tenDanhMuc?.toLowerCase() === filterLower
      );
    }

    if (this.filterTenThuongHieu) {
      const filterLower = this.filterTenThuongHieu.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.tenThuongHieu?.toLowerCase() === filterLower
      );
    }

    this.products = [...filteredProducts];
    this.productCacheService.setProducts([...this.products]);

    console.log('Sản phẩm đã lọc:', this.products);
    if (this.products.length === 0) {
      console.log('Không có sản phẩm nào khớp với bộ lọc hoặc từ khóa tìm kiếm.');
      this.orderStateService.updateState({
        errorMessage: 'Không có sản phẩm nào khớp với bộ lọc hoặc từ khóa tìm kiếm.',
      });
    } else {
      this.orderStateService.updateState({ errorMessage: '' });
    }
    this.cdr.detectChanges();
  }

  onSearchInput(): void {
    this.orderStateService.updateState({ searchKeyword: this.searchKeyword });
    this.filterProducts();
  }

  onFilterTenNhomHuongChange(event: string): void {
    this.orderStateService.updateState({ filterTenNhomHuong: event });
    this.filterProducts();
  }

  onFilterTenDanhMucChange(event: string): void {
    this.orderStateService.updateState({ filterTenDanhMuc: event });
    this.filterProducts();
  }

  onFilterTenThuongHieuChange(event: string): void {
    this.orderStateService.updateState({ filterTenThuongHieu: event });
    this.filterProducts();
  }

  addNewOrder(): void {
    this.orders.push({
      donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
      chiTietDonHangs: [],
      phuongThucThanhToan: 'tm',
      maGiamGia: null,
      completed: false,
    });
    this.currentOrderIndex = this.orders.length - 1;
    this.orderStateService.updateState({
      orders: this.orders,
      currentOrderIndex: this.currentOrderIndex,
    });
    this.calculateTotal();
    this.reapplyDiscountIfExists();
  }

  switchOrder(index: number): void {
    this.currentOrderIndex = index;
    this.orderStateService.updateState({ currentOrderIndex: this.currentOrderIndex });
    this.calculateTotal();
    this.reapplyDiscountIfExists();
  }

  closeOrderTab(index: number): void {
    if (this.orders.length <= 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Phải có ít nhất 1 đơn hàng!',
      });
      return;
    }
    this.orders.splice(index, 1);
    if (this.currentOrderIndex >= this.orders.length) {
      this.currentOrderIndex = this.orders.length - 1;
    }
    this.orderStateService.updateState({
      orders: this.orders,
      currentOrderIndex: this.currentOrderIndex,
    });
    this.calculateTotal();
    this.reapplyDiscountIfExists();
  }

  openQuantityModal(product: any): void {
    this.orderStateService.updateState({
      selectedProduct: product,
      selectedQuantity: 1,
      showQuantityModal: true,
    });
  }

  closeQuantityModal(): void {
    this.orderStateService.updateState({
      showQuantityModal: false,
      selectedProduct: null,
      selectedQuantity: 1,
    });
  }

  calculateTotal(): void {
    console.log('chiTietDonHangs:', this.currentOrder.chiTietDonHangs);
    this.totalBeforeDiscount = this.currentOrder.chiTietDonHangs.reduce(
      (total: number, item: any) => {
        console.log('Item thanhTien:', item.thanhTien);
        return total + (item.thanhTien || 0);
      },
      0
    );
    this.totalAfterDiscount = this.totalBeforeDiscount - this.discountAmount;
    console.log('Tổng trước giảm giá:', this.totalBeforeDiscount);
    this.orderStateService.updateState({
      totalBeforeDiscount: this.totalBeforeDiscount,
      totalAfterDiscount: this.totalAfterDiscount,
    });
  }

  confirmAddProduct(): void {
    if (!this.selectedProduct) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không có sản phẩm được chọn!',
      });
      return;
    }

    if (this.selectedQuantity < 1) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Số lượng phải lớn hơn 0!',
      });
      return;
    }

    if (!this.selectedProduct.idSpct || isNaN(this.selectedProduct.idSpct)) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'ID sản phẩm chi tiết (idSpct) không hợp lệ!',
      });
      return;
    }

    if (!this.selectedProduct.donGia || this.selectedProduct.donGia <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Sản phẩm "${this.selectedProduct.tenSanPham || 'Không xác định'}" có giá không hợp lệ!`,
      });
      return;
    }

    const product = this.allProducts.find(p => p.idSpct === this.selectedProduct.idSpct);

    const existingItem = this.currentOrder.chiTietDonHangs.find(
      (item: any) =>
        item.tenSanPham === this.selectedProduct.tenSanPham &&
        item.dungTich === this.selectedProduct.dungTich &&
        item.idSanPham === this.selectedProduct.idSanPham
    );
    if (existingItem) {
      existingItem.soLuong += this.selectedQuantity;
      existingItem.thanhTien = existingItem.donGia * existingItem.soLuong;
    } else {
      this.currentOrder.chiTietDonHangs.push({
        idSanPham: this.selectedProduct.idSanPham,
        idSpct: this.selectedProduct.idSpct,
        tenSanPham: this.selectedProduct.tenSanPham,
        donGia: this.selectedProduct.donGia || 0,
        dungTich: this.selectedProduct.dungTich,
        urlImage: this.selectedProduct.urlImage,
        soLuong: this.selectedQuantity,
        thanhTien: (this.selectedProduct.donGia || 0) * this.selectedQuantity,
      });
    }

    this.orderStateService.updateState({ orders: this.orders });
    this.calculateTotal();
    this.reapplyDiscountIfExists();
    this.closeQuantityModal();
  }

  increaseQuantity(index: number): void {
    const item = this.currentOrder.chiTietDonHangs[index];
    const product = this.allProducts.find(p => p.idSpct === item.idSpct);
  
    // Kiểm tra nếu sản phẩm tồn tại và số lượng muốn tăng vượt quá tồn kho
    if (product && item.soLuong + 1 > product.soLuongtonkho) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: `Số lượng tồn kho của sản phẩm ${product.tenSanPham} chỉ còn ${product.soLuongtonkho}! Không thể thêm nữa.`,
        confirmButtonText: 'Đóng',
      });
      return; // Dừng hàm, không tăng số lượng
    }
  
    // Nếu không vượt quá tồn kho, tiến hành tăng số lượng
    item.soLuong++;
    item.thanhTien = item.donGia * item.soLuong;
    this.orderStateService.updateState({ orders: this.orders });
    this.calculateTotal();
    this.reapplyDiscountIfExists();
    this.cdr.detectChanges();
  }

  decreaseQuantity(index: number): void {
    if (this.currentOrder.chiTietDonHangs[index].soLuong > 1) {
      this.currentOrder.chiTietDonHangs[index].soLuong--;
      this.currentOrder.chiTietDonHangs[index].thanhTien =
        this.currentOrder.chiTietDonHangs[index].donGia * this.currentOrder.chiTietDonHangs[index].soLuong;
      this.orderStateService.updateState({ orders: this.orders });
      this.calculateTotal();
      this.reapplyDiscountIfExists();
      this.cdr.detectChanges();
    }
  }

  removeProduct(index: number): void {
    this.currentOrder.chiTietDonHangs.splice(index, 1);
    this.orderStateService.updateState({ orders: this.orders });
    this.calculateTotal();
    this.reapplyDiscountIfExists();
    this.cdr.detectChanges();
  }

  applyDiscountCode(): void {
    if (!this.discountCodeInput) {
      this.orderStateService.updateState({ discountMessage: 'Vui lòng nhập mã giảm giá!' });
      return;
    }
  
    if (this.totalBeforeDiscount <= 0) {
      this.orderStateService.updateState({ discountMessage: 'Giỏ hàng trống, không thể áp dụng mã giảm giá!' });
      return;
    }
  
    this.orderStateService.updateState({ isLoading: true, discountMessage: null });
  
    this.orderoffservice.getDiscountCodeDetails(this.discountCodeInput).subscribe(
      (response) => {
        this.orderStateService.updateState({ isLoading: false });
        console.log('Chi tiết mã giảm giá:', response);
        if (!response || response.trangThai !== 1 ) { // Giả sử trangThai = 1 là hoạt động
          this.currentOrder.maGiamGia = null;
          this.orderStateService.updateState({
            discountDetails: null,
            totalAfterDiscount: undefined,
            discountAmount: 0,
            discountMessage: 'Mã giảm giá không hoạt động !',
            orders: this.orders,
          });
          this.cdr.detectChanges();
          return;
        }
        // Kiểm tra điều kiện áp dụng (online/offline)
        if (response.dieuKienapDung !== 0) {
          this.currentOrder.maGiamGia = null;
          this.orderStateService.updateState({
            discountDetails: null,
            totalAfterDiscount: undefined,
            discountAmount: 0,
            discountMessage: 'Mã giảm giá này chỉ áp dụng cho đơn hàng online!',
            orders: this.orders,
          });
          this.cdr.detectChanges();
          return;
        }
  
        // Kiểm tra giá trị tối thiểu của đơn hàng
        if (response.giaTriDonToiThieu && this.totalBeforeDiscount < response.giaTriDonToiThieu) {
          this.currentOrder.maGiamGia = null;
          this.orderStateService.updateState({
            discountDetails: null,
            totalAfterDiscount: undefined,
            discountAmount: 0,
            discountMessage: `Tổng giá trị đơn hàng không đủ để áp dụng mã giảm giá này! Cần tối thiểu: ${response.giaTriDonToiThieu.toLocaleString()} VNĐ`,
            orders: this.orders,
          });
          this.cdr.detectChanges();
          return;
        }
  
        // Nếu mã giảm giá hợp lệ và đủ điều kiện, tiến hành áp dụng
        this.discountDetails = response;
        this.currentOrder.maGiamGia = this.discountCodeInput;
  
        this.applyDiscountLogic(response);
  
        this.orderStateService.updateState({
          discountDetails: this.discountDetails,
          discountMessage: `Áp dụng mã giảm giá thành công! Số tiền giảm: ${this.discountAmount.toLocaleString()} VNĐ`,
          orders: this.orders,
        });
        this.cdr.detectChanges();
      },
      (error) => {
        this.orderStateService.updateState({
          isLoading: false,
          discountMessage: 'Mã giảm giá không tồn tại hoặc không hợp lệ!',
        });
        this.currentOrder.maGiamGia = null;
        this.orderStateService.updateState({
          discountDetails: null,
          totalAfterDiscount: undefined,
          discountAmount: 0,
          orders: this.orders,
        });
        this.cdr.detectChanges();
        console.error('Lỗi khi lấy mã giảm giá:', error);
      }
    );
  }

  private applyDiscountLogic(response: any): void {
    let discountAmount = this.totalBeforeDiscount * response.giaTriGiam;
    console.log('Số tiền giảm ban đầu:', discountAmount);

    if (response.gia_tri_toi_da && discountAmount > response.gia_tri_toi_da) {
      discountAmount = response.gia_tri_toi_da;
      console.log('Điều chỉnh số tiền giảm (giới hạn tối đa):', discountAmount);
    }

    if (discountAmount > this.totalBeforeDiscount) {
      discountAmount = this.totalBeforeDiscount;
      console.log('Điều chỉnh số tiền giảm (không vượt quá tổng):', discountAmount);
    }

    this.discountAmount = discountAmount;
    this.totalAfterDiscount = this.totalBeforeDiscount - discountAmount;
    console.log('Số tiền giảm cuối cùng:', this.discountAmount);
    console.log('Tổng sau giảm giá:', this.totalAfterDiscount);
    this.orderStateService.updateState({
      discountAmount: this.discountAmount,
      totalAfterDiscount: this.totalAfterDiscount,
    });
  }

  private reapplyDiscountIfExists(): void {
    if (this.currentOrder.maGiamGia && this.discountDetails) {
      this.applyDiscountLogic(this.discountDetails);
      this.orderStateService.updateState({
        discountMessage: `Áp dụng mã giảm giá thành công! Số tiền giảm: ${this.discountAmount.toLocaleString()} VNĐ`,
      });
      this.cdr.detectChanges();
    } else {
      this.orderStateService.updateState({
        totalAfterDiscount: undefined,
        discountAmount: 0,
        discountMessage: null,
      });
    }
  }

  validateOrder(): boolean {
    if (this.currentOrder.chiTietDonHangs.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Giỏ hàng trống, không thể tạo đơn hàng!',
      });
      return false;
    }

    const idTaiKhoan = this.tokenService.getUserId();
    if (!idTaiKhoan) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể lấy ID tài khoản. Vui lòng đăng nhập lại!',
      });
      return false;
    }

    const invalidItem = this.currentOrder.chiTietDonHangs.find((item: any) => !item.idSanPham);
    if (invalidItem) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: `Sản phẩm "${invalidItem.tenSanPham || 'Không xác định'}" có ID không hợp lệ!`,
      });
      return false;
    }

    return true;
  }

  updatePaymentMethod(method: string): void {
    console.log('Phương thức thanh toán được chọn:', method);
    this.currentOrder.phuongThucThanhToan = method;
    console.log('Giá trị phuongThucThanhToan sau khi cập nhật:', this.currentOrder.phuongThucThanhToan);
    this.orderStateService.updateState({ orders: this.orders });
  }

  private async generatePDF(orderData: any): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('jsPDF không thể chạy trong môi trường SSR hoặc Node');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tạo PDF trong môi trường SSR!',
      });
      return;
    }
    const userInfo = this.tokenService.getUserInfo();
    console.log('Thông tin người dùng:', userInfo);
    const username = userInfo.sub || 'Không xác định';
    const vaiTro = userInfo.roles;
    const escapeHtml = (unsafe: string) => {
      if (!unsafe) return '';
      return unsafe
        .replace(/&/g, '&')
        .replace(/</g, '<')
        .replace(/>/g, '>')
        .replace(/"/g, '"')
        .replace(/'/g, '');
    };

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '210mm';
    container.style.padding = '10px';
    container.style.fontFamily = 'Arial, sans-serif';
    document.body.appendChild(container);

    const chiTietDonHangs = orderData.chiTietDonHangs || [];
    const rows = chiTietDonHangs.map((item: any) => {
      const tenSanPham = escapeHtml(item.tenSanPham || 'Không xác định');
      const soLuong = item.soLuong || 0;
      const donGia = item.donGia ? item.donGia.toLocaleString() : '0';
      const thanhTien = item.thanhTien ? item.thanhTien.toLocaleString() : '0';

      return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${tenSanPham}</td>
          <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${donGia} VNĐ</td>
          <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${soLuong}</td>
          <td style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">${thanhTien} VNĐ</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <div style="font-size: 12px;">
        <div id="header-section">
          <h2 style="text-align: center; font-size: 18px; margin-bottom: 8px; color: red;">HÓA ĐƠN BÁN HÀNG</h2>
          <h3 style="text-align: center; font-size: 14px; margin-bottom: 15px;">Mã đơn hàng: #${this.formatOrderId(orderData)}</h3>

          <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
            <div style="width: 45%;">
              <p style="font-size: 10px;"><strong>Người nhận hàng</strong></p>
              <p style="font-size: 10px;">Họ tên: ${escapeHtml(orderData.tenNguoiNhanHang)}</p>
              <p style="font-size: 10px;">SĐT: ${escapeHtml(orderData.sdtNguoiNhan)}</p>
            </div>
            <div style="width: 45%;">
              <p style="font-size: 10px;"><strong>Ngày đặt: ${escapeHtml(orderData.ngayTao || 'N/A')}</strong></p>
              <p style="font-size: 10px;"><strong>Phương thức thanh toán: ${escapeHtml(orderData.phuongThucThanhToan || 'N/A')}</strong></p>
              <p style="font-size: 10px;"><strong>Phương thức vận chuyển: Giao hàng nhanh</strong></p>
            </div>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;" id="product-table">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">Sản phẩm</th>
              <th style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">Giá</th>
              <th style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">Số lượng</th>
              <th style="border: 1px solid #ddd; padding: 4px; font-size: 10px;">Tổng</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="4" style="border: 1px solid #ddd; padding: 4px; text-align: center; font-size: 10px;">Không có sản phẩm</td></tr>'}
          </tbody>
        </table>

        <div style="display: flex; justify-content: space-between; margin-bottom: 15px;" id="footer">
          <div style="width: 45%;">
            <p style="font-size: 10px;"><strong>Số tiền giảm: ${(this.totalBeforeDiscount - orderData.total) >= 0 ? (this.totalBeforeDiscount - orderData.total).toLocaleString() : '0'} VNĐ</strong></p>
            <p style="font-size: 10px;"><strong>Ngày ${new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</strong></p>
          </div>
          <div style="width: 45%; text-align: right;">
            <p style="font-size: 10px;"><strong>(Ký tên)</strong></p>
          </div>
        </div>

        <p style="font-size: 12px; font-weight: bold; text-align: right;" id="total">Tổng tiền: ${orderData.total ? orderData.total.toLocaleString() : '0'} VNĐ</p>
      </div>
    `;

    container.innerHTML = htmlContent;
    console.log('Container HTML trước khi render:', container.innerHTML);

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 5;
    let yPosition = margin;

    const addElementToPDF = async (element: HTMLElement, addNewPageIfNeeded: boolean = true) => {
      if (!element) {
        console.warn('Phần tử rỗng hoặc không xác định, bỏ qua render.');
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        logging: true,
      });
      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const imgHeight = (canvas.height * (pageWidth - 2 * margin)) / canvas.width;

      if (yPosition + imgHeight > pageHeight - margin && addNewPageIfNeeded) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.addImage(imgData, 'JPEG', margin, yPosition, pageWidth - 2 * margin, imgHeight);
      yPosition += imgHeight + 5;
    };

    try {
      const headerSection = container.querySelector('#header-section') as HTMLElement;
      const productTable = container.querySelector('#product-table') as HTMLElement;
      const footer = container.querySelector('#footer') as HTMLElement;
      const total = container.querySelector('#total') as HTMLElement;

      if (headerSection) {
        console.log('Đang render phần header...');
        await addElementToPDF(headerSection);
      } else {
        console.warn('Không tìm thấy phần header!');
      }

      if (productTable) {
        console.log('Đang render bảng sản phẩm...');
        await addElementToPDF(productTable);
      } else {
        console.warn('Không tìm thấy bảng sản phẩm!');
      }

      if (footer) {
        console.log('Đang render phần footer...');
        await addElementToPDF(footer);
      } else {
        console.warn('Không tìm thấy phần footer!');
      }

      if (total) {
        console.log('Đang render tổng tiền...');
        await addElementToPDF(total, false);
      } else {
        console.warn('Không tìm thấy phần tổng tiền!');
      }

      pdf.save(`hoadon_${orderData.orderId || 'unknown'}.pdf`);
    } catch (error) {
      console.error('Lỗi khi tạo PDF:', error);
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tạo PDF. Vui lòng thử lại!',
      });
    } finally {
      document.body.removeChild(container);
    }
  }

  cancelOrder(): void {
    if (!this.orderId) {
      this.orderStateService.updateState({ isLoading: false });
      this.resetCurrentOrder();
      return;
    }

    Swal.fire({
      title: 'Hủy đơn hàng',
      text: 'Vui lòng nhập lý do hủy đơn:',
      input: 'text',
      inputPlaceholder: 'Nhập lý do hủy...',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận hủy',
      cancelButtonText: 'Quay lại',
      preConfirm: (lyDoHuy) => {
        if (!lyDoHuy) {
          Swal.showValidationMessage('Lý do hủy không được để trống!');
        }
        return lyDoHuy;
      },
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderoffservice.updateOrderStatus(this.orderId!, {
          trangThai: 5,
          lyDoHuy: result.value,
        }).subscribe(
          (updateResponse) => {
            this.orderStateService.updateState({ isLoading: false });
            console.log('Hủy đơn hàng thành công:', updateResponse);
            Swal.fire({
              icon: 'info',
              title: 'Đã hủy',
              text: 'Đơn hàng đã được hủy!',
              timer: 1500,
              showConfirmButton: false,
            });

            this.resetCurrentOrder();
            this.orderStatusUpdated.emit();
          },
          (error) => {
            this.orderStateService.updateState({ isLoading: false });
            console.error('Lỗi khi hủy đơn hàng:', error);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: 'Không thể hủy đơn hàng. Vui lòng thử lại!',
            });
          }
        );
      } else {
        this.orderoffservice.updateOrderStatus(this.orderId!, {
          trangThai: 5,
          lyDoHuy: 'Người dùng đóng modal mà không in hóa đơn',
        }).subscribe(
          (updateResponse) => {
            this.orderStateService.updateState({ isLoading: false });
            console.log('Hủy đơn hàng thành công:', updateResponse);
            Swal.fire({
              icon: 'info',
              title: 'Đã hủy',
              text: 'Đơn hàng đã được hủy!',
              timer: 1500,
              showConfirmButton: false,
            });

            this.resetCurrentOrder();
            this.orderStatusUpdated.emit();
          },
          (error) => {
            this.orderStateService.updateState({ isLoading: false });
            console.error('Lỗi khi hủy đơn hàng:', error);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: 'Không thể hủy đơn hàng. Vui lòng thử lại!',
            });
          }
        );
      }
    });
  }

  private formatOrderId(orderData: any): string {
    const date = new Date(orderData.ngayTao);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const paddedId = orderData.orderId.toString().padStart(4, '0');
    return `${dateString}${paddedId}`;
  }

  resetCurrentOrder(): void {
    this.orders[this.currentOrderIndex] = {
      donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
      chiTietDonHangs: [],
      phuongThucThanhToan: 'tm',
      maGiamGia: null,
      completed: false,
    };
    this.orderStateService.updateState({
      orders: this.orders,
      discountCodeInput: '',
      discountMessage: null,
      totalAfterDiscount: undefined,
      discountAmount: 0,
      discountDetails: null,
      vietQRString: null,
      finalAmount: 0,
    });
    this.calculateTotal();
    this.cdr.detectChanges();
  }
}
