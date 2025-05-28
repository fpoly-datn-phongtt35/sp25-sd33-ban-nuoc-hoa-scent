import { Component, OnInit, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DonhangService } from '../../../service/donhang.service';
import { OrderDetaiComponent } from '../order-detail/order-detail.component';
import { HoadonComponent } from '../../../hoadon/hoadon.component';
import { TokenService } from '../../../service/token.service';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../../../service/WebSocketService';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, OrderDetaiComponent],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  providers: [NgbActiveModal],
})
export class InvoiceComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  selectedStatus: number | null = null;
  selectedPaymentMethod: string = 'tm';
  orderId: number | null = null;
  searchControl = new FormControl<string>('');
  filteredDonhang: any[] = [];
  page: number = 0;
  size: number = 15;
  totalPages: number = 20;
  cancellationReason: string | null = null;
  cancellationReasons: { [key: number]: string } = {};
  showPagination: boolean = false;
  selectedOrder: any = null;
  userID: number | null = null;
  tenDangNhap: string | null = null;
  @Input() selectedTab: string = 'online';

  keyToStatus: Record<string, number> = {
    pending: 1,
    unPaid: 1,
    processed: 2,
    shipping: 3,
    prepaid: 6,
    completed: 4,
    cancelled: 5,
  };

 private allowedStatuses: { [key: string]: number[] } = {
  online: [1, 2, 3, 4, 5, 6],
  offline: [4, 5],
  'online_ck': [1, 3,4, 5, 6], // Chuyển khoản: Chờ xác nhận, Đã thanh toán, Hoàn thành, Đã hủy
  'online_tm': [1, 2, 3, 4, 5], // Tiền mặt: Chờ xác nhận, Đã xác nhận, Đang giao, Hoàn thành, Đã hủy
};

  private webSocketSubscription: Subscription | undefined;
  private searchSubscription: Subscription | undefined;

  constructor(
    private http: HttpClient,
    private donHangService: DonhangService,
    private modalService: NgbModal,
    private router: Router,
    private tokenService: TokenService,
    private webSocketService: WebSocketService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo) {
      this.userID = userInfo.UserID;
      this.tenDangNhap = userInfo.sub;
     
      this.loadCustomers().then(() => {
        this.setupSearch();
        this.webSocketService.connectAdmin();
        this.webSocketSubscription = this.webSocketService.getAdminMessages().subscribe({
          next: (update: any) => this.handleWebSocketUpdate(update),
          error: (error) => console.error('WebSocket subscription error:', error),
          complete: () => console.log('WebSocket subscription completed'),
        });
      });
    } else {
     
      this.showErrorMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
      return;
    }
  }

  ngOnDestroy(): void {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  private handleWebSocketUpdate(update: any): void {

    if (!update || !update.idDonHang || update.trangThai === undefined) {

      return;
    }

    const { idDonHang, trangThai, isNewOrder } = update;

    if (isNewOrder) {
     
      this.fetchOrderDetails(idDonHang);
    } else {
      
      const orderToUpdate = this.orders.find((order) => order.id === idDonHang);
      if (orderToUpdate) {
        orderToUpdate.selectedStatus = trangThai;
        this.applySearch();

        if (this.selectedOrder && this.selectedOrder.id === idDonHang) {
          this.selectedOrder.selectedStatus = trangThai;
        }

        this.cdRef.detectChanges();

        Swal.fire({
          title: 'Cập nhật trạng thái',
          text: `Đơn hàng ${idDonHang} đã được cập nhật thành ${this.getStatusText(trangThai)}`,
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        
        this.loadCustomers();
      }
    }
  }

  private setupSearch(): void {
  this.searchSubscription = this.searchControl.valueChanges.pipe(
    debounceTime(100),
    distinctUntilChanged()
  ).subscribe((keyword) => {
    this.applySearch(keyword ?? '');
  });
}

  private fetchOrderDetails(orderId: number): void {
    this.http.get(`http://localhost:8080/rest/don-hang/${orderId}`).subscribe({
      next: (orderDetails: any) => {
       
        const newOrder = {
          ...orderDetails,
          selectedStatus: orderDetails.trangThai,
        };
        this.orders.unshift(newOrder);
        this.orders.sort((a, b) => b.id - a.id);
        this.applySearch();

        this.cdRef.detectChanges();

        Swal.fire({
          title: 'Đơn hàng mới',
          text: `Đơn hàng ${orderId} đã được tạo thành công!`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      },
      error: (error) => {
        
        this.showErrorMessage('Không thể tải thông tin đơn hàng mới.');
      },
    });
  }

  private getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Chờ xác nhận';
      case 2:
        return 'Đã xác nhận';
      case 3:
        return 'Đang giao';
      case 4:
        return 'Hoàn thành';
      case 5:
        return 'Đã hủy';
      case 6:
        return 'Đã thanh toán';
      default:
        return 'Không xác định';
    }
  }

  formatOrderId(order: any): string {
    const date = new Date(order.ngayTao);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateString = `${year}${month}${day}`;
    const paddedId = order.id.toString().padStart(4, '0');
    return `${dateString}${paddedId}`;
  }

  switchTab(tab: string): void {
    this.selectedTab = tab;
    this.selectedPaymentMethod = "tm"; // Reset payment method filter
    this.selectedStatus = null; // Reset status filter
    this.applySearch(this.searchControl.value || '');
  }

  onRowClick(order: any) {
    this.selectedOrder = order;
  }

  closeDetail() {
    this.selectedOrder = null;
  }

 private applySearch(keyword: string | null = ''): void {
  const searchTerm = (keyword ?? '').toLowerCase().trim();
  const statusCode = this.selectedStatus;
  const paymentMethod = this.selectedPaymentMethod;

  // Lọc đơn hàng dựa trên từ khóa tìm kiếm
  let filteredResults = this.orders.filter((order) => {
    const idDonHangStringFake = this.formatOrderId(order);
    const searchableText = [
      idDonHangStringFake,
      order.tenNguoiNhanHang,
      order.sdtNguoiNhan,
      order.diaChiGiaoHang,
      order.ghiChu,
      order.phuongThucThanhToan,
      order.taiKhoan?.tenDangNhap,
    ]
      .filter((field) => field != null)
      .map((field) => field.toString().toLowerCase())
      .join(' ');

    return searchTerm === '' || searchableText.includes(searchTerm);
  });

  // Nếu chỉ tìm thấy 1 đơn hàng, tự động điều chỉnh bộ lọc
  if (filteredResults.length === 1) {
    const order = filteredResults[0];
    const isOnline = order.luongBan === 1;

    // Cập nhật selectedTab
    this.selectedTab = isOnline ? 'online' : 'offline';

    // Cập nhật selectedPaymentMethod (chỉ áp dụng cho tab online)
    if (isOnline) {
      this.selectedPaymentMethod = order.phuongThucThanhToan?.toLowerCase() || 'tm';
    } else {
      this.selectedPaymentMethod = null; // Reset nếu là offline
    }

    // Cập nhật selectedStatus
    this.selectedStatus = order.selectedStatus;

    // Kiểm tra xem trạng thái có được phép trong tab hiện tại không
    const statusKey = this.selectedTab === 'online' && this.selectedPaymentMethod
      ? `online_${this.selectedPaymentMethod}`
      : this.selectedTab;
    const allowedStatuses = this.allowedStatuses[statusKey] || this.allowedStatuses[this.selectedTab] || [];

    if (!allowedStatuses.includes(order.selectedStatus)) {
      this.selectedStatus = null; // Reset nếu trạng thái không hợp lệ
    }
  } else {
    // Nếu có nhiều hơn 1 đơn hàng hoặc không có đơn hàng nào, giữ bộ lọc hiện tại
    const statusKey = this.selectedTab === 'online' && paymentMethod
      ? `online_${paymentMethod}`
      : this.selectedTab;
    const allowedStatuses = this.allowedStatuses[statusKey] || this.allowedStatuses[this.selectedTab] || [];

    filteredResults = filteredResults.filter((order) => {
      const matchesStatus = statusCode == null || order.selectedStatus === statusCode;
      const matchesPaymentMethod =
        this.selectedTab !== 'online' ||
        paymentMethod == null ||
        order.phuongThucThanhToan?.toLowerCase() === paymentMethod;
      const isOnline = order.luongBan === 1;
      const matchesTab = this.selectedTab === 'online' ? isOnline : !isOnline;
      const matchesAllowedStatus =
        allowedStatuses.length === 0 || allowedStatuses.includes(order.selectedStatus);

      return matchesStatus && matchesPaymentMethod && matchesTab && matchesAllowedStatus;
    });
  }

  this.filteredDonhang = filteredResults;
  this.cdRef.detectChanges();
}

  private checkInventory(orderId: number): boolean {
   
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) {
     
      this.showErrorMessage('Không tìm thấy đơn hàng để kiểm tra tồn kho.');
      return false;
    }

    
    const chiTietDonHang = order.chiTietDonHangs || [];
    if (!Array.isArray(chiTietDonHang) || chiTietDonHang.length === 0) {
    
      this.showErrorMessage('Không tìm thấy chi tiết đơn hàng để kiểm tra tồn kho.');
      return false;
    }

    for (const item of chiTietDonHang) {
      const soLuong = item.soLuong ?? 0;
      const soLuongTonKho = item.spct.soLuongTonKho?? 0;
      const tenSanPham = item.spct.sanPham?.tenSanPham ?? 'Sản phẩm không xác định';
      const dungTich = item.spct.dungTich;

     
      if (soLuong > soLuongTonKho) {
        Swal.fire({
          title: 'Lỗi tồn kho',
          text: `Sản phẩm "${tenSanPham}" dung tích "${dungTich}" có số lượng yêu cầu (${soLuong}) lớn hơn số lượng tồn kho (${soLuongTonKho}). Vui lòng kiểm tra và cập nhật số lượng tồn kho.`,
          icon: 'warning',
          confirmButtonText: 'OK',
        });
        return false;
      }
    }


    return true;
  }

  async confirmStatusChange(order: any) {
    const isCK = order.phuongThucThanhToan?.toLowerCase().includes('ck');
    const nextStatus = this.getNextStatusCode(order.selectedStatus, isCK);
    const nextStatusText = this.getNextStatusText(order.selectedStatus, isCK);
  
    // Kiểm tra tồn kho nếu đang ở trạng thái "Chờ xác nhận" (1)
    if (order.selectedStatus === 1) {
      const isInventorySufficient = await this.checkInventory(order.id);
      if (!isInventorySufficient) {
        return;
      }
  
      // Nếu là thanh toán chuyển khoản (CK) và đang chuyển từ trạng thái 1 sang 6
      if (isCK && nextStatus === 6) {
        Swal.fire({
          title: 'Kiểm tra tài khoản ngân hàng',
          text: `Vui lòng kiểm tra tài khoản ngân hàng để xác nhận thanh toán cho đơn hàng ${this.formatOrderId(order)}. Bạn có muốn xác nhận đã nhận được thanh toán không?`,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Xác nhận',
          cancelButtonText: 'Hủy',
        }).then((result) => {
          if (result.isConfirmed) {
            this.updateStatus(order.id, nextStatus);
          } else {
            this.showErrorMessage('Đã hủy xác nhận thanh toán. Trạng thái đơn hàng không thay đổi.');
          }
        });
        return;
      }
    }
  
    // Xử lý các trạng thái khác (2 -> 3, 6 -> 3, v.v.)
    if ((order.selectedStatus === 2 || order.selectedStatus === 6) && nextStatus === 3) {
      const modalRef = this.modalService.open(HoadonComponent, { size: 'lg' });
      modalRef.componentInstance.orderData = order;
      modalRef.result.then(
        (result) => {
          if (result === 'confirm') {
            this.updateStatus(order.id, nextStatus);
          }
        },
        (reason) => {
          // Người dùng đóng modal mà không xác nhận
        }
      );
    } else if (order.selectedStatus === 3) {
      this.selectShippingOption(order.id);
      return;
    } else {
      // Xử lý các trường hợp khác (ví dụ: 1 -> 2 cho tiền mặt)
      Swal.fire({
        title: 'Xác nhận chuyển trạng thái',
        text: `Chuyển trạng thái đơn hàng sang "${nextStatusText}"?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Hủy',
      }).then((result) => {
        if (result.isConfirmed) {
          this.updateStatus(order.id, nextStatus);
        }
      });
    }
  }

  openInvoiceModal(order: any) {
    const modalRef = this.modalService.open(HoadonComponent, { size: 'lg' });
    modalRef.componentInstance.order = order;
    modalRef.result.then(
      (result) => {
        if (result === 'printed') {
          this.updateStatus(order.id, 3);
        }
      },
      (reason) => {
        
      }
    );
  }

  requestCancellationReason(orderId: number): void {
    Swal.fire({
      title: 'Vui lòng nhập lý do giao hàng không thành công:',
      input: 'text',
      inputPlaceholder: 'Nhập lý do...',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed && result.value.trim() !== '') {
        this.updateStatusWithReason(orderId, 5, result.value);
      } else if (result.isConfirmed) {
        this.showErrorMessage('Lý do hủy không được để trống! Vui lòng nhập lại.');
      }
    });
  }

  selectShippingOption(orderId: number): void {
    Swal.fire({
      title: 'Chọn hành động tiếp theo',
      input: 'select',
      inputOptions: {
        '1': '✅ Đã Nhận Hàng (Hoàn thành)',
        '2': '❌ Giao không thành công',
      },
      inputPlaceholder: 'Chọn hành động',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const choice = result.value;
        if (choice === '1') this.updateStatus(orderId, 4);
        else if (choice === '2') this.requestCancellationReason(orderId);
        else this.showErrorMessage('Vui lòng chọn một hành động hợp lệ.');
      }
    });
  }

  updateStatus(orderId: number, newStatus: number, ghiChu?: string) {
    if (!this.userID || !this.tenDangNhap) {
      this.showErrorMessage('User not logged in or token invalid.');
      return;
    }

    const params = {
      trangThai: newStatus,
      userID: this.userID,
      tenDangNhap: this.tenDangNhap,
      ghiChu: ghiChu || undefined,
    };

    const url = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}`;
    this.http.put(url, {}, { params }).subscribe({
      next: (response) => {
        const order = this.orders.find((o) => o.id === orderId);
        if (order) {
          order.selectedStatus = newStatus;
        }
        this.applySearch();
        this.filterOrders(this.getFilterKey(newStatus));
        Swal.fire('Cập nhật thành công!', '', 'success');
      },
      error: (error) => {
        
        this.showErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      },
    });
  }

  updateStatusWithReason(orderId: number, newStatus: number, cancellationReason: string) {
    if (!this.userID || !this.tenDangNhap) {
      this.showErrorMessage('User not logged in or token invalid.');
      return;
    }

    const params = {
      trangThai: newStatus,
      userID: this.userID,
      tenDangNhap: this.tenDangNhap,
      lyDoHuy: cancellationReason,
    };

    const url = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}`;
    this.http.put(url, {}, { params }).subscribe({
      next: (response) => {
        const order = this.orders.find((o) => o.id === orderId);
        if (order) {
          order.selectedStatus = newStatus;
          order.lyDoHuy = cancellationReason;
        }
        this.applySearch();
        this.filterOrders(this.getFilterKey(newStatus));
        Swal.fire('✅ Thành công', 'Đơn hàng đã được chuyển trạng thái thành giao không thành công!', 'success');
      },
      error: (error) => {
  
        this.showErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      },
    });
  }

  showErrorMessage(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: message,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
    });
  }

  loadCustomers(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.donHangService.getDonhang(this.selectedStatus ?? -1).subscribe({
        next: (response) => {
          this.orders = response.map((order: any) => ({
            ...order,
            selectedStatus: order.trangThai,
          }));
          this.orders.sort((a, b) => b.id - a.id);
      
          this.applySearch();
          resolve();
        },
        error: (error: any) => {
        
          this.showErrorMessage('Không thể tải danh sách đơn hàng.');
          reject(error);
        },
      });
    });
  }

  filterOrders(status: string): void {
    const statusCode = this.keyToStatus[status] ?? null;
    this.selectedStatus = statusCode;
    this.applySearch(this.searchControl.value || '');
  }

  filterByPaymentMethod(method: string | null): void {
    this.selectedPaymentMethod = method;
    this.selectedStatus = null; // Reset status filter when payment method changes
    this.applySearch(this.searchControl.value || '');
  }

  getFilterKey(status: number): string {
    switch (status) {
      case 1:
        return 'pending';
      case 2:
        return 'processed';
      case 3:
        return 'shipping';
      case 4:
        return 'completed';
      case 5:
        return 'cancelled';
      case 6:
        return 'prepaid';
      default:
        return '';
    }
  }

  getStatusStyle(status: number) {
    switch (status) {
      case 1:
        return { color: 'red', 'font-weight': 'bold' };
      case 2:
        return { color: 'blue', 'font-weight': 'bold' };
      case 3:
        return { color: 'rgb(159, 159, 6)', 'font-weight': 'bold' };
      case 4:
        return { color: 'white', 'background-color': 'green', 'font-weight': 'bold' };
      case 5:
        return { color: 'black', 'background-color': 'lightgray', 'font-weight': 'bold' };
      case 6:
        return { color: 'white', 'background-color': 'grey', 'font-weight': 'bold' };
      default:
        return { 'text-decoration': 'none' };
    }
  }

 getNextStatusText(currentStatus: number, isCK: boolean): string {
  switch (currentStatus) {
    case 1:
      return isCK ? 'Đã Thanh Toán' : 'Đã Xác Nhận';
    case 2:
      return 'Đang Giao';
    case 3:
      return 'Đã Hoàn Thành';
    case 6:
      return 'Đang Giao';
    default:
      return 'Không xác định';
  }
}

 getNextStatusCode(currentStatus: number, isCK: boolean): number {
  switch (currentStatus) {
    case 1:
      return isCK ? 6 : 2;
    case 2:
      return 3;
    case 3:
      return 4;
    case 6:
      return 3;
    default:
      return currentStatus;
  }
}

  goToPage(p: number) {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      this.page = p;
      this.loadCustomers();
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadCustomers();
    }
  }

  nextPage() {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadCustomers();
    }
  }

  getPaginationRange(): number[] {
    let range: number[] = [];
    let start = Math.max(0, this.page - 2);
    let end = Math.min(this.totalPages, this.page + 3);

    for (let i = start; i < end; i++) {
      range.push(i);
    }

    return range;
  }

  getPaymentMethod(method: string): string {
    const normalized = method?.toLowerCase();
    switch (normalized) {
      case 'ck':
        return 'Chuyển khoản';
      case 'tm':
        return 'Tiền mặt';
      case 'momo':
        return 'Ví MoMo';
      default:
        return '❓ Không rõ';
    }
  }
}