import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DonhangService } from '../../service/donhang.service';
import { OrderDetaiAdminComponent } from '../order-detai-admin/order-detai-admin.component';
import { HttpClient } from '@angular/common/http';
import { UserDetailOrderComponent } from '../user-detail-order/user-detail-order.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
  providers: [NgbActiveModal]
})
export class InvoiceComponent implements OnInit {
  orders: any[] = [];
  selectedStatus: number | null = null;
  orderId: number | null = null;
  filteredDonhang: any[] = [];
  page: number = 0;
  size: number = 15;
  totalPages: number = 20;
  cancellationReason: string | null = null;
  cancellationReasons: { [key: number]: string } = {};
  showPagination: boolean = false;

  keyToStatus: Record<string, number> = {
    pending: 1,
    unPaid: 1,
    processed: 2,
    shipping: 3,
    prepaid: 6,
    completed: 4,
    cancelled: 5,
  };

  constructor(private http: HttpClient, private donHangService: DonhangService, private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.filteredDonhang = this.orders;
  }

  confirmStatusChange(order: any) {
    const isCK = order.phuongThucThanhToan?.toLowerCase().includes('ck');

    if (order.selectedStatus === 3) {
      this.selectShippingOption(order.id);
      return;
    }

    const nextStatus = this.getNextStatusCode(order.selectedStatus, isCK);
    const nextStatusText = this.getNextStatusText(order.selectedStatus, isCK);

    Swal.fire({
      title: 'Xác nhận chuyển trạng thái',
      text: `Chuyển trạng thái đơn hàng sang "${nextStatusText}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Hủy'
    }).then(result => {
      if (result.isConfirmed) {
        this.updateStatus(order.id, nextStatus);
      }
    });
  }
  requestCancellationReason(orderId: number): void {
    Swal.fire({
      title: 'Vui lòng nhập lý do hủy đơn hàng:',
      input: 'text',
      inputPlaceholder: 'Nhập lý do...',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Hủy',
    }).then(result => {
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
        '2': '❌ Hủy Đơn (Khách không nhận)'
      },
      inputPlaceholder: 'Chọn hành động',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Hủy',
    }).then(result => {
      if (result.isConfirmed) {
        const choice = result.value;
        if (choice === '1') this.updateStatus(orderId, 4);
        else if (choice === '2') this.requestCancellationReason(orderId);
        else this.showErrorMessage("Vui lòng chọn một hành động hợp lệ.");
      }
    });
  }

  updateStatus(orderId: number, newStatus: number) {
    const url = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}?trangThai=${newStatus}`;
    this.http.put(url, {}).subscribe(
      response => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.selectedStatus = newStatus;
        }
        this.filterOrders(this.getFilterKey(newStatus));
        Swal.fire('Cập nhật thành công!', '', 'success');
      },
      error => {
        console.error('Error updating status', error);
        this.showErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      }
    );
  }

  updateStatusWithReason(orderId: number, newStatus: number, cancellationReason: string) {
    const url = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}?trangThai=${newStatus}&lyDoHuy=${encodeURIComponent(cancellationReason)}`;
    this.http.put(url, {}).subscribe(
      response => {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
          order.selectedStatus = newStatus;
          order.lyDoHuy = cancellationReason;
        }
        this.filterOrders(this.getFilterKey(newStatus));
        Swal.fire('✅ Thành công', 'Đơn hàng đã được hủy!', 'success');
      },
      error => {
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
      timer: 3000
    });
  }

  xemChiTietTaiKhoan(order: any) {
    const modalRef = this.modalService.open(UserDetailOrderComponent);
    modalRef.componentInstance.taiKhoan = order.taiKhoan;
  }

  openDetailModal(order: any) {
    const modalRef = this.modalService.open(OrderDetaiAdminComponent, { size: 'lg' });
    modalRef.componentInstance.order = order;
  }

  loadCustomers(): void {
    this.donHangService.getDonhang(this.selectedStatus ?? -1).subscribe({
      next: (response) => {
        this.orders = response.map((order: any) => ({
          ...order,
          selectedStatus: order.trangThai,
        }));
        this.filterOrders(this.selectedStatus !== null ? this.selectedStatus.toString() : '');
      },
      error: (error: any) => console.error('Error loading orders', error)
    });
  }

  filterOrders(status: string): void {
    const statusCode = this.keyToStatus[status] ?? null;
    if (statusCode !== null) {
      this.filteredDonhang = this.orders.filter(order => order.selectedStatus === statusCode);
      this.selectedStatus = statusCode;
      this.showPagination = false;
    } else {
      this.filteredDonhang = [...this.orders];
      this.selectedStatus = null;
      this.showPagination = true;
    }
  }

  getFilterKey(status: number): string {
    switch (status) {
      case 1: return 'pending';
      case 2: return 'processed';
      case 3: return 'shipping';
      case 4: return 'completed';
      case 5: return 'cancelled';
      case 6: return 'prepaid';
      default: return '';
    }
  }

  getStatusStyle(status: number) {
    switch (status) {
      case 1: return { 'color': 'red', 'font-weight': 'bold' };
      case 2: return { 'color': 'blue', 'font-weight': 'bold' };
      case 3: return { 'color': 'rgb(159, 159, 6)', 'font-weight': 'bold' };
      case 4: return { 'color': 'white', 'background-color': 'green', 'font-weight': 'bold' };
      case 5: return { 'color': 'black', 'background-color': 'lightgray', 'font-weight': 'bold' };
      case 6: return { 'color': 'white', 'background-color': 'grey', 'font-weight': 'bold' };
      default: return {};
    }
  }

  getNextStatusText(currentStatus: number, isCK: boolean): string {
    switch (currentStatus) {
      case 1: return 'Đã Xác Nhận';
      case 2: return 'Đang Giao';
      case 3: return 'Đã Hoàn Thành';
      case 6: return 'Đang Giao';
      default: return 'Không xác định';
    }
  }

  getNextStatusCode(currentStatus: number, isCK: boolean): number {
    switch (currentStatus) {
      case 1: return isCK ? 6 : 2;
      case 2: return 3;
      case 3: return 4;
      case 6: return 3;
      default: return currentStatus;
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
}
