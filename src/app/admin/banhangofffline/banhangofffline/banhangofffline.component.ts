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

@Component({
  selector: 'app-banhangoffline',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './banhangofffline.component.html',
  styleUrls: ['./banhangofffline.component.scss']
})
export class OfflineOrderComponent implements OnInit, OnDestroy {
  orders: any[] = [
    {
      donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
      chiTietDonHangs: [],
      phuongThucThanhToan: 'tm',
      maGiamGia: null,
      completed: false
    }
  ];
  currentOrderIndex: number = 0;
  orderId: number | null = null;
  vietQRString: string | null = null;
  finalAmount: number = 0;

  get currentOrder() {
    return this.orders[this.currentOrderIndex];
  }

  nhomHuongList: string[] = [];
  danhMucList: string[] = [];
  thuongHieuList: string[] = [];

  allProducts: any[] = [];
  products: any[] = [];
  searchKeyword: string = '';
  filterTenNhomHuong: string = '';
  filterTenDanhMuc: string = '';
  filterTenThuongHieu: string = '';

  errorMessage: string | null = null;
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
  private sessionId: string;
  orderStatusUpdated = new EventEmitter<void>();
  @Input() isComponentSwitched: boolean = false;

  constructor(
    private orderoffservice: OrderOffService,
    private tokenService: TokenService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private homeAdminComponent: HomeAdminComponent,
    private vietQRService: VietQRService, // Inject VietQRService
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Tạo sessionId duy nhất khi khởi tạo component
    this.sessionId = localStorage.getItem('sessionId') || this.generateSessionId();
    localStorage.setItem('sessionId', this.sessionId);
  }

  private generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  ngOnInit(): void {
    if (!this.tokenService.isLoggedIn()) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Bạn cần đăng nhập để sử dụng chức năng này!',
        timer: 1500,
        showConfirmButton: false,
      });
      this.router.navigate(['/login']);
      return;
    }

    const userInfo = this.tokenService.getUserInfo();
    console.log('User Info:', userInfo);

    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      console.log('Không có sessionId trong localStorage, reset trạng thái.');
      this.resetState();
      return;
    }

    const storedSessionId = localStorage.getItem('sessionId');
    const savedOrders = localStorage.getItem(`offlineOrders_${sessionId}`);
    console.log('storedSessionId:', storedSessionId, 'isComponentSwitched:', this.homeAdminComponent.isComponentSwitched);
    console.log('savedOrders:', savedOrders);

    if (
      this.homeAdminComponent.isComponentSwitched &&
      storedSessionId === sessionId &&
      savedOrders
    ) {
      console.log('Khôi phục trạng thái từ localStorage vì sessionId khớp và có dữ liệu.');
      this.restoreStateFromLocalStorage(sessionId);
    } else {
      console.log('Không khôi phục trạng thái, reset về mặc định.');
      this.resetState();
    }

    if (!this.currentOrder.chiTietDonHangs) {
      this.currentOrder.chiTietDonHangs = [];
    }

    console.log('Phương thức thanh toán sau khi khôi phục:', this.currentOrder.phuongThucThanhToan); // Thêm log để kiểm tra

    if (this.currentOrder.chiTietDonHangs.length > 0) {
      this.calculateTotal();
    }
    this.loadAllProducts();
  }

  private resetState(): void {
    this.orders = [{
      donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
      chiTietDonHangs: [],
      phuongThucThanhToan: 'tm',
      maGiamGia: null,
      completed: false
    }];
    this.currentOrderIndex = 0;
    this.discountCodeInput = '';
    this.discountDetails = null;
    this.discountAmount = 0;
    this.discountMessage = null;
    this.totalBeforeDiscount = 0;
    this.totalAfterDiscount = undefined;
    this.searchKeyword = '';
    this.filterTenNhomHuong = '';
    this.filterTenDanhMuc = '';
    this.filterTenThuongHieu = '';
    this.allProducts = [];
    this.products = [];
    this.nhomHuongList = [];
    this.danhMucList = [];
    this.thuongHieuList = [];
    this.errorMessage = null;
    this.isLoading = false;
    this.showQuantityModal = false;
    this.selectedProduct = null;
    this.selectedQuantity = 1;
    this.vietQRString = null; // Reset VietQR string
    this.finalAmount = 0; // Reset final amount
    this.saveStateToLocalStorage();
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

  ngOnDestroy(): void {
    this.saveStateToLocalStorage();
  }

  public saveStateToLocalStorage(): void {
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) return;

    localStorage.setItem(`offlineOrders_${sessionId}`, JSON.stringify(this.orders));
    localStorage.setItem(`currentOrderIndex_${sessionId}`, this.currentOrderIndex.toString());
    localStorage.setItem(`discountCodeInput_${sessionId}`, this.discountCodeInput);
    localStorage.setItem(`discountDetails_${sessionId}`, JSON.stringify(this.discountDetails));
    localStorage.setItem(`discountAmount_${sessionId}`, this.discountAmount.toString());
    localStorage.setItem(`discountMessage_${sessionId}`, this.discountMessage || '');
    localStorage.setItem(`totalBeforeDiscount_${sessionId}`, this.totalBeforeDiscount.toString());
    localStorage.setItem(`totalAfterDiscount_${sessionId}`, this.totalAfterDiscount?.toString() || '');
    localStorage.setItem(`searchKeyword_${sessionId}`, this.searchKeyword);
    localStorage.setItem(`filterTenNhomHuong_${sessionId}`, this.filterTenNhomHuong);
    localStorage.setItem(`filterTenDanhMuc_${sessionId}`, this.filterTenDanhMuc);
    localStorage.setItem(`filterTenThuongHieu_${sessionId}`, this.filterTenThuongHieu);
    localStorage.setItem(`allProducts_${sessionId}`, JSON.stringify(this.allProducts));
    localStorage.setItem(`products_${sessionId}`, JSON.stringify(this.products));
    localStorage.setItem(`nhomHuongList_${sessionId}`, JSON.stringify(this.nhomHuongList));
    localStorage.setItem(`danhMucList_${sessionId}`, JSON.stringify(this.danhMucList));
    localStorage.setItem(`thuongHieuList_${sessionId}`, JSON.stringify(this.thuongHieuList));
    localStorage.setItem(`errorMessage_${sessionId}`, this.errorMessage || '');
    localStorage.setItem(`isLoading_${sessionId}`, this.isLoading.toString());
    localStorage.setItem(`showQuantityModal_${sessionId}`, this.showQuantityModal.toString());
    localStorage.setItem(`selectedProduct_${sessionId}`, JSON.stringify(this.selectedProduct));
    localStorage.setItem(`selectedQuantity_${sessionId}`, this.selectedQuantity.toString());
    localStorage.setItem(`vietQRString_${sessionId}`, this.vietQRString || '');
    localStorage.setItem(`finalAmount_${sessionId}`, this.finalAmount.toString());
  }

  private restoreStateFromLocalStorage(sessionId: string): void {
    const storedSessionId = localStorage.getItem('sessionId');
    if (storedSessionId !== sessionId) {
      console.log('SessionId không khớp, không khôi phục trạng thái.');
      this.resetState();
      return;
    }

    const savedOrders = localStorage.getItem(`offlineOrders_${sessionId}`);
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders);
      this.orders = this.orders.map(order => ({
        ...order,
        completed: order.completed ?? false,
        chiTietDonHangs: order.chiTietDonHangs ?? [],
      }));
    } else {
      this.resetState();
    }

    this.currentOrderIndex = localStorage.getItem(`currentOrderIndex_${sessionId}`)
      ? Number(localStorage.getItem(`currentOrderIndex_${sessionId}`))
      : 0;

    this.discountCodeInput = localStorage.getItem(`discountCodeInput_${sessionId}`) || '';
    this.discountDetails = localStorage.getItem(`discountDetails_${sessionId}`)
      ? JSON.parse(localStorage.getItem(`discountDetails_${sessionId}`)!)
      : null;
    this.discountAmount = Number(localStorage.getItem(`discountAmount_${sessionId}`)) || 0;
    this.discountMessage = localStorage.getItem(`discountMessage_${sessionId}`) || null;
    this.totalBeforeDiscount = Number(localStorage.getItem(`totalBeforeDiscount_${sessionId}`)) || 0;
    this.totalAfterDiscount = localStorage.getItem(`totalAfterDiscount_${sessionId}`)
      ? Number(localStorage.getItem(`totalAfterDiscount_${sessionId}`))
      : undefined;
    this.searchKeyword = localStorage.getItem(`searchKeyword_${sessionId}`) || '';
    this.filterTenNhomHuong = localStorage.getItem(`filterTenNhomHuong_${sessionId}`) || '';
    this.filterTenDanhMuc = localStorage.getItem(`filterTenDanhMuc_${sessionId}`) || '';
    this.filterTenThuongHieu = localStorage.getItem(`filterTenThuongHieu_${sessionId}`) || '';
    this.allProducts = localStorage.getItem(`allProducts_${sessionId}`)
      ? JSON.parse(localStorage.getItem(`allProducts_${sessionId}`)!)
      : [];
    this.products = localStorage.getItem(`products_${sessionId}`)
      ? JSON.parse(localStorage.getItem(`products_${sessionId}`)!)
      : [];
    this.nhomHuongList = localStorage.getItem(`nhomHuongList_${sessionId}`)
      ? JSON.parse(localStorage.getItem(`nhomHuongList_${sessionId}`)!)
      : [];
    this.danhMucList = localStorage.getItem(`danhMucList_${sessionId}`)
      ? JSON.parse(localStorage.getItem(`danhMucList_${sessionId}`)!)
      : [];
    this.thuongHieuList = localStorage.getItem(`thuongHieuList_${sessionId}`)
      ? JSON.parse(localStorage.getItem(`thuongHieuList_${sessionId}`)!)
      : [];
    this.errorMessage = localStorage.getItem(`errorMessage_${sessionId}`) || null;
    this.isLoading = localStorage.getItem(`isLoading_${sessionId}`) === 'true';
    this.showQuantityModal = localStorage.getItem(`showQuantityModal_${sessionId}`) === 'true';
    this.selectedProduct = localStorage.getItem(`selectedProduct_${sessionId}`)
      ? JSON.parse(localStorage.getItem(`selectedProduct_${sessionId}`)!)
      : null;
    this.selectedQuantity = Number(localStorage.getItem(`selectedQuantity_${sessionId}`)) || 1;
    this.vietQRString = localStorage.getItem(`vietQRString_${sessionId}`) || null;
    this.finalAmount = Number(localStorage.getItem(`finalAmount_${sessionId}`)) || 0;

    console.log('Trạng thái sau khi khôi phục:', this.orders);
  }

  updateCustomerInfo(field: 'tenNguoiNhanHang' | 'sdtNguoiNhan', value: string): void {
    this.currentOrder.donHang[field] = value;
    this.saveStateToLocalStorage();
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
          console.log('Response từ API VietQR:', response);
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

    this.isLoading = true;

    const userId = this.tokenService.getUserInfo();
    if (!userId || !userId.UserID || isNaN(userId.UserID) || userId.UserID <= 0) {
      this.isLoading = false;
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
        this.isLoading = false;
        this.orderId = response.orderId;
        this.totalAfterDiscount = response.tongTien;
        this.finalAmount = this.totalAfterDiscount;

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

        // Sửa điều kiện để kiểm tra 'ck' thay vì 'qr'
        if (this.currentOrder.phuongThucThanhToan === 'ck') {
          const orderIdString = `ORDER_${this.orderId}`;
          const orderInfo = `Thanh toán đơn hàng ${this.orderId} từ SCENT`;

          try {
            this.vietQRString = await this.generateVietQRString(orderIdString, this.finalAmount, orderInfo);
            console.log('vietQRString:', this.vietQRString);

            if (!this.vietQRString) {
              throw new Error('Không nhận được dữ liệu mã QR từ API VietQR');
            }

            const result = await Swal.fire({
              title: 'Quét mã QR để thanh toán',
              html: `
                <p>Số tiền: ${this.finalAmount.toLocaleString()} VNĐ</p>
                <p>Nội dung: ${orderInfo}</p>
                <img src="${this.vietQRString}" alt="QR Code" width="200" height="200" />
                <p>Vui lòng quét mã QR để thanh toán. Sau khi thanh toán xong, nhấn "Xác nhận" để tiếp tục.</p>
              `,
              confirmButtonText: 'Xác nhận',
              showCancelButton: true,
              cancelButtonText: 'Hủy',
            });

            if (result.isConfirmed) {
              this.finalizeOrder(orderData);
            } else {
              this.cancelOrder();
            }
          } catch (error) {
            Swal.fire({
              title: 'Lỗi',
              text: `Không thể tạo mã QR. Vui lòng thử lại sau! ${error.message || ''}`,
              icon: 'error',
              confirmButtonText: 'OK',
            });
            this.cancelOrder();
          }
        } else {
          this.finalizeOrder(orderData);
        }
      },
      (error) => {
        this.isLoading = false;
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
    this.isLoading = true;
    this.errorMessage = null;
    this.orderoffservice.searchSanPham('').subscribe(
      (data) => {
        this.allProducts = data || [];
        this.products = [...this.allProducts];
        console.log('All Products loaded:', this.allProducts);

        this.nhomHuongList = [
          ...new Set(
            this.allProducts
              .map(product => product?.tenNhomHuong)
              .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
          )
        ].sort();
        this.danhMucList = [
          ...new Set(
            this.allProducts
              .map(product => product?.tenDanhMuc)
              .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
          )
        ].sort();
        this.thuongHieuList = [
          ...new Set(
            this.allProducts
              .map(product => product?.tenThuongHieu)
              .filter((value): value is string => typeof value === 'string' && value.trim() !== '')
          )
        ].sort();

        console.log('Nhom Huong List:', this.nhomHuongList);
        console.log('Danh Muc List:', this.danhMucList);
        console.log('Thuong Hieu List:', this.thuongHieuList);

        this.isLoading = false;
        this.filterProducts();
        this.saveStateToLocalStorage();
      },
      (error) => {
        console.error('Error fetching products:', error);
        this.errorMessage = 'Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.';
        this.allProducts = [];
        this.products = [];
        this.nhomHuongList = [];
        this.danhMucList = [];
        this.thuongHieuList = [];
        this.isLoading = false;
        this.saveStateToLocalStorage();
      }
    );
  }

  onSearchInput(): void {
    this.filterProducts();
    this.saveStateToLocalStorage();
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
    console.log('Filtered Products:', this.products);
    if (this.products.length === 0) {
      console.log('No products match the current filters or search keyword.');
    }
    this.cdr.detectChanges();
    this.saveStateToLocalStorage();
  }

  onFilterTenNhomHuongChange(event: string): void {
    this.filterTenNhomHuong = event;
    this.filterProducts();
    this.saveStateToLocalStorage();
  }

  onFilterTenDanhMucChange(event: string): void {
    this.filterTenDanhMuc = event;
    this.filterProducts();
    this.saveStateToLocalStorage();
  }

  onFilterTenThuongHieuChange(event: string): void {
    this.filterTenThuongHieu = event;
    this.filterProducts();
    this.saveStateToLocalStorage();
  }

  addNewOrder(): void {
    this.orders.push({
      donHang: { tenNguoiNhanHang: '', sdtNguoiNhan: '' },
      chiTietDonHangs: [],
      phuongThucThanhToan: 'tm',
      maGiamGia: null,
      completed: false
    });
    this.currentOrderIndex = this.orders.length - 1;
    this.calculateTotal();
    this.reapplyDiscountIfExists();
    this.saveStateToLocalStorage();
  }

  switchOrder(index: number): void {
    this.currentOrderIndex = index;
    this.calculateTotal();
    this.reapplyDiscountIfExists();
    this.saveStateToLocalStorage();
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
    this.calculateTotal();
    this.reapplyDiscountIfExists();
    this.saveStateToLocalStorage();
  }

  openQuantityModal(product: any): void {
    this.selectedProduct = product;
    this.selectedQuantity = 1;
    this.showQuantityModal = true;
    this.saveStateToLocalStorage();
  }

  closeQuantityModal(): void {
    this.showQuantityModal = false;
    this.selectedProduct = null;
    this.selectedQuantity = 1;
    this.saveStateToLocalStorage();
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
    console.log('Total Before Discount:', this.totalBeforeDiscount);
    this.saveStateToLocalStorage();
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
        thanhTien: (this.selectedProduct.donGia || 0) * this.selectedQuantity
      });
    }

    this.calculateTotal();
    this.reapplyDiscountIfExists();
    this.closeQuantityModal();
    this.saveStateToLocalStorage();
  }

  increaseQuantity(index: number): void {
    this.currentOrder.chiTietDonHangs[index].soLuong++;
    this.currentOrder.chiTietDonHangs[index].thanhTien =
      this.currentOrder.chiTietDonHangs[index].donGia * this.currentOrder.chiTietDonHangs[index].soLuong;
    this.calculateTotal();
    this.reapplyDiscountIfExists();
    this.cdr.detectChanges();
    this.saveStateToLocalStorage();
  }

  decreaseQuantity(index: number): void {
    if (this.currentOrder.chiTietDonHangs[index].soLuong > 1) {
      this.currentOrder.chiTietDonHangs[index].soLuong--;
      this.currentOrder.chiTietDonHangs[index].thanhTien =
        this.currentOrder.chiTietDonHangs[index].donGia * this.currentOrder.chiTietDonHangs[index].soLuong;
      this.calculateTotal();
      this.reapplyDiscountIfExists();
      this.cdr.detectChanges();
      this.saveStateToLocalStorage();
    }
  }

  removeProduct(index: number): void {
    this.currentOrder.chiTietDonHangs.splice(index, 1);
    this.calculateTotal();
    this.reapplyDiscountIfExists();
    this.cdr.detectChanges();
    this.saveStateToLocalStorage();
  }

  applyDiscountCode(): void {
    if (!this.discountCodeInput) {
      this.discountMessage = 'Vui lòng nhập mã giảm giá!';
      this.saveStateToLocalStorage();
      return;
    }

    if (this.totalBeforeDiscount <= 0) {
      this.discountMessage = 'Giỏ hàng trống, không thể áp dụng mã giảm giá!';
      this.saveStateToLocalStorage();
      return;
    }

    this.isLoading = true;
    this.discountMessage = null;

    this.orderoffservice.getDiscountCodeDetails(this.discountCodeInput).subscribe(
      (response) => {
        this.isLoading = false;
        console.log('Discount code details:', response);

        if (response.dieuKienapDung !== 0) {
          this.currentOrder.maGiamGia = null;
          this.discountDetails = null;
          this.totalAfterDiscount = undefined;
          this.discountAmount = 0;
          this.discountMessage = 'Mã giảm giá này chỉ áp dụng cho đơn hàng online!';
          this.cdr.detectChanges();
          this.saveStateToLocalStorage();
          return;
        }

        this.discountDetails = response;
        this.currentOrder.maGiamGia = this.discountCodeInput;

        this.applyDiscountLogic(response);

        this.discountMessage = `Áp dụng mã giảm giá thành công! Số tiền giảm: ${this.discountAmount.toLocaleString()} VNĐ`;
        this.cdr.detectChanges();
        this.saveStateToLocalStorage();
      },
      (error) => {
        this.isLoading = false;
        this.currentOrder.maGiamGia = null;
        this.discountDetails = null;
        this.totalAfterDiscount = undefined;
        this.discountAmount = 0;
        this.discountMessage = 'Mã giảm giá không tồn tại hoặc không hợp lệ!';
        this.cdr.detectChanges();
        console.error('Error fetching discount code:', error);
        this.saveStateToLocalStorage();
      }
    );
  }

  private applyDiscountLogic(response: any): void {
    let discountAmount = this.totalBeforeDiscount * response.giaTriGiam;
    console.log('Initial discountAmount:', discountAmount);

    if (response.gia_tri_toi_da && discountAmount > response.gia_tri_toi_da) {
      discountAmount = response.gia_tri_toi_da;
      console.log('Adjusted discountAmount (max limit):', discountAmount);
    }

    if (discountAmount > this.totalBeforeDiscount) {
      discountAmount = this.totalBeforeDiscount;
      console.log('Adjusted discountAmount (cannot exceed total):', discountAmount);
    }

    this.discountAmount = discountAmount;
    this.totalAfterDiscount = this.totalBeforeDiscount - discountAmount;
    console.log('Final discountAmount:', this.discountAmount);
    console.log('Total after discount:', this.totalAfterDiscount);
    this.saveStateToLocalStorage();
  }

  private reapplyDiscountIfExists(): void {
    if (this.currentOrder.maGiamGia && this.discountDetails) {
      this.applyDiscountLogic(this.discountDetails);
      this.discountMessage = `Áp dụng mã giảm giá thành công! Số tiền giảm: ${this.discountAmount.toLocaleString()} VNĐ`;
      this.cdr.detectChanges();
    } else {
      this.totalAfterDiscount = undefined;
      this.discountAmount = 0;
      this.discountMessage = null;
    }
    this.saveStateToLocalStorage();
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
    console.log('Phương thức thanh toán được chọn:', method); // Thêm log để debug
    this.currentOrder.phuongThucThanhToan = method;
    console.log('Giá trị phuongThucThanhToan sau khi cập nhật:', this.currentOrder.phuongThucThanhToan); // Thêm log để kiểm tra
    this.saveStateToLocalStorage();
  }

  private async generatePDF(orderData: any): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      console.error('jsPDF cannot run in SSR or Node environment');
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Không thể tạo PDF trong môi trường SSR!',
      });
      return;
    }
    const userInfo = this.tokenService.getUserInfo();
    console.log('User Info:', userInfo);
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
    console.log('Container HTML before rendering:', container.innerHTML);

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
        console.warn('Element is null or undefined, skipping rendering.');
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
        console.log('Rendering header section...');
        await addElementToPDF(headerSection);
      } else {
        console.warn('Header section not found!');
      }

      if (productTable) {
        console.log('Rendering product table...');
        await addElementToPDF(productTable);
      } else {
        console.warn('Product table not found!');
      }

      if (footer) {
        console.log('Rendering footer...');
        await addElementToPDF(footer);
      } else {
        console.warn('Footer not found!');
      }

      if (total) {
        console.log('Rendering total...');
        await addElementToPDF(total, false);
      } else {
        console.warn('Total not found!');
      }

      pdf.save(`hoadon_${orderData.orderId || 'unknown'}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
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
      this.isLoading = false;
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
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.orderoffservice.updateOrderStatus(this.orderId!, {
          trangThai: 5,
          lyDoHuy: result.value,
        }).subscribe(
          (updateResponse) => {
            this.isLoading = false;
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
            this.isLoading = false;
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
            this.isLoading = false;
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
            this.isLoading = false;
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
      completed: false
    };
    this.discountCodeInput = '';
    this.discountMessage = null;
    this.totalAfterDiscount = undefined;
    this.discountAmount = 0;
    this.discountDetails = null;
    this.vietQRString = null;
    this.finalAmount = 0;
    this.calculateTotal();
    this.cdr.detectChanges();
    this.saveStateToLocalStorage();
  }
}
