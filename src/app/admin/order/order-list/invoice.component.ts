import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { DonhangService } from '../../../service/donhang.service';
import { OrderDetaiComponent } from '../order-detail/order-detail.component';
import { HoadonComponent } from '../../../hoadon/hoadon.component';
import { TokenService } from '../../../service/token.service'; // Import TokenService

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, OrderDetaiComponent],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  providers: [NgbActiveModal],
})
export class InvoiceComponent implements OnInit {
  lichSuThaoTac: any[] = [];
  orders: any[] = [];
  selectedStatus: number | null = null;
  orderId: number | null = null;
  searchKeyword: string = '';
  filteredDonhang: any[] = [];
  page: number = 0;
  size: number = 15;
  totalPages: number = 20;
  cancellationReason: string | null = null;
  cancellationReasons: { [key: number]: string } = {};
  showPagination: boolean = false;
  selectedOrder: any = null;
  userID: number | null = null; // Store userID
  tenDangNhap: string | null = null; // Store tenDangNhap

  keyToStatus: Record<string, number> = {
    pending: 1,
    unPaid: 1,
    processed: 2,
    shipping: 3,
    prepaid: 6,
    completed: 4,
    cancelled: 5,
  };

  constructor(
    private http: HttpClient,
    private donHangService: DonhangService,
    private modalService: NgbModal,
    private router: Router,
    private tokenService: TokenService // Inject TokenService
  ) {}

  ngOnInit(): void {
    // Retrieve UserID and tenDangNhap from TokenService
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo) {
      this.userID = userInfo.UserID; // Updated to UserID
      this.tenDangNhap = userInfo.sub;
      console.log('UserID:', this.userID);
      console.log('tenDangNhap:', this.tenDangNhap);
    } else {
      console.error('User not logged in or token invalid');
      this.showErrorMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 3000);
      return;
    }

    this.loadCustomers();
    this.filteredDonhang = this.orders;
  }

  onRowClick(order: any) {
    this.selectedOrder = order;
    this.loadLichSuThaoTac(order.id);
  }

  closeDetail() {
    this.selectedOrder = null;
  }

  loadLichSuThaoTac(maDonHang: number) {
    this.donHangService.getLichSuThaoTac(maDonHang).subscribe({
      next: (response) => {
        this.lichSuThaoTac = response;
        console.log('Lịch sử thao tác:', this.lichSuThaoTac);
      },
      error: (error) => {
        console.error('Error loading lịch sử thao tác', error);
        this.showErrorMessage('Không thể tải lịch sử thao tác.');
      },
    });
  }

  applySearch(): void {
    const keyword = this.searchKeyword.toLowerCase().trim();
    const statusCode = this.selectedStatus;

    this.filteredDonhang = this.orders.filter((order) => {
      const matchesKeyword =
        keyword === '' ||
        order.id?.toString().includes(keyword) ||
        order.tenNguoiNhanHang?.toLowerCase().includes(keyword) ||
        order.sdtNguoiNhan?.toLowerCase().includes(keyword) ||
        order.diaChiGiaoHang?.toLowerCase().includes(keyword) ||
        order.ghiChu?.toLowerCase().includes(keyword) ||
        order.phuongThucThanhToan?.toLowerCase().includes(keyword) ||
        order.taiKhoan?.tenDangNhap?.toLowerCase().includes(keyword);

      const matchesStatus = statusCode == null || order.selectedStatus === statusCode;

      return matchesKeyword && matchesStatus;
    });
  }

  confirmStatusChange(order: any) {
    const isCK = order.phuongThucThanhToan?.toLowerCase().includes('ck');
    const nextStatus = this.getNextStatusCode(order.selectedStatus, isCK);
    const nextStatusText = this.getNextStatusText(order.selectedStatus, isCK);

    if ((order.selectedStatus === 2 || order.selectedStatus === 6) && nextStatus === 3) {
      const modalRef = this.modalService.open(HoadonComponent, { size: 'lg' });
      modalRef.componentInstance.orderData = order;
      modalRef.result.then(
        (result) => {
          console.log('Modal result:', result);
          if (result === 'confirm') {
            this.updateStatus(order.id, nextStatus);
            console.log(`Updated status to ${nextStatus} for order ${order.id}`);
          } else {
            console.log('Modal did not return "confirm", status not updated');
          }
        },
        (reason) => {
          console.error('Modal dismissed or error:', reason);
        }
      );
    } else {
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
          console.log(`Updated status to ${nextStatus} for order ${order.id}`);
        }
      });
    }

    if (order.selectedStatus === 3) {
      this.selectShippingOption(order.id);
      return;
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
        // Handle if invoice printing fails
      }
    );
  }

  requestCancellationReason(orderId: number): void {
    Swal.fire({
      title: 'Vui lòng nhập lý do hủy đơn hàng:',
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
        '2': '❌ Hủy Đơn (Khách không nhận)',
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
      ghiChu: ghiChu || undefined, // Optional
    };

    const url = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}`;
    this.http.put(url, {}, { params }).subscribe(
      (response) => {
        const order = this.orders.find((o) => o.id === orderId);
        if (order) {
          console.log(`Successfully updated status for order ${orderId} to ${newStatus}`, response);
          order.selectedStatus = newStatus;
          this.loadLichSuThaoTac(orderId);
        }
        this.filterOrders(this.getFilterKey(newStatus));
        Swal.fire('Cập nhật thành công!', '', 'success');
      },
      (error) => {
        console.error('Error updating status', error);
        this.showErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      }
    );
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
    this.http.put(url, {}, { params }).subscribe(
      (response) => {
        const order = this.orders.find((o) => o.id === orderId);
        if (order) {
          order.selectedStatus = newStatus;
          order.lyDoHuy = cancellationReason;
          this.loadLichSuThaoTac(orderId);
        }
        this.filterOrders(this.getFilterKey(newStatus));
        Swal.fire('✅ Thành công', 'Đơn hàng đã được hủy!', 'success');
      },
      (error) => {
        console.error('Error updating status', error);
        this.showErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      }
    );
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

  loadCustomers(): void {
    this.donHangService.getDonhang(this.selectedStatus ?? -1).subscribe({
      next: (response) => {
        this.orders = response.map((order: any) => ({
          ...order,
          selectedStatus: order.trangThai,
        }));
        console.log(this.orders);
        this.filterOrders(this.selectedStatus !== null ? this.selectedStatus.toString() : '');
      },
      error: (error: any) => console.error('Error loading orders', error),
    });
  }

  filterOrders(status: string): void {
    const statusCode = this.keyToStatus[status] ?? null;
    this.selectedStatus = statusCode;
    this.applySearch();
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
        return {};
    }
  }

  getNextStatusText(currentStatus: number, isCK: boolean): string {
    switch (currentStatus) {
      case 1:
        return 'Đã Xác Nhận';
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
        return ' Chuyển khoản';
      case 'tienmat':
        return ' Tiền mặt';
      case 'momo':
        return ' Ví MoMo';
      case 'tm':
        return ' Tiền mặt';
      default:
        return '❓ Không rõ';
    }
  }
}