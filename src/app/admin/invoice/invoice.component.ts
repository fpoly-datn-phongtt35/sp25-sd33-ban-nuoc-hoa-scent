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
    processed: 2,
    shipping: 3,
    paid: 4,
    cancelled: 5,
  };
  constructor(private http: HttpClient,private donHangService: DonhangService,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.filteredDonhang = this.orders;
  }
  confirmStatusChange(orderId: number, newStatus: number) {
    const nextStatusText = this.getStatusText(newStatus);
    let actionMessage = '';

    switch (newStatus) {
      case 2:
        actionMessage = 'Xác nhận đơn hàng để chuẩn bị giao hàng?';
        break;
      case 3:
        actionMessage = 'Bắt đầu giao hàng cho khách?';
        break;
      case 4:
        actionMessage = 'Xác nhận khách đã thanh toán đơn hàng?';
        break;
      case 5:
        actionMessage = 'Bạn có chắc muốn huỷ đơn hàng này?';
        break;
      case 1:
        actionMessage = 'Khôi phục đơn hàng về trạng thái chờ xác nhận?';
        break;
      default:
        actionMessage = `Chuyển trạng thái sang "${nextStatusText}"?`;
        break;
    }

    Swal.fire({
      title: 'Xác nhận thay đổi trạng thái',
      text: actionMessage,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Hủy'
    }).then(result => {
      if (result.isConfirmed) {
        this.updateStatus(orderId, newStatus);
      }
    });
  }

  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Chờ Xác Nhận';
      case 2: return 'Đã Xác Nhận';
      case 3: return 'Đang Giao';
      case 4: return 'Đã Thanh Toán';
      case 5: return 'Đã Hủy';
      default: return 'Không xác định';
    }
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

  selectPaymentOption(orderId: number): void {
    const order = this.orders.find(o => o.id === orderId);
    if (!order || [4, 5].includes(order.selectedStatus)) {
      this.showErrorMessage("Đơn hàng đã hoàn tất hoặc đã hủy. Không thể thay đổi trạng thái.");
      return;
    }

    Swal.fire({
      title: 'Chọn hành động tiếp theo',
      input: 'select',
      inputOptions: {
        '1': '✅ Đã Thanh Toán',
        '2': '❌ Đã Hủy'
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

// Thông báo lỗi sử dụng SweetAlert2
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
    modalRef.componentInstance.taiKhoan = order.taiKhoan; // Truyền dữ liệu vào modal
  }
  openDetailModal(order: any) {
    const modalRef = this.modalService.open(OrderDetaiAdminComponent, { size: 'lg' });
    modalRef.componentInstance.order = order; // Truyền đơn hàng vào component modal
  }
  loadCustomers(): void {
    // Chỉ cần gọi API với tham số trangThai, không cần truyền page và size
    this.donHangService.getDonhang(this.selectedStatus ?? -1).subscribe({
      next: (response) => {
        // Nhận danh sách đơn hàng
        this.orders = response.map((order: { trangThai: any; }) => ({
          ...order,
          selectedStatus: order.trangThai, // Lưu trạng thái vào selectedStatus
        }));

        // Sau khi nhận được đơn hàng, lọc theo trạng thái đã chọn
        this.filterOrders(this.selectedStatus !== null ? this.selectedStatus.toString() : '');

        // Lưu tổng số trang từ response của API nếu có (nếu API hỗ trợ phân trang)
        // Nếu API không phân trang, bạn có thể bỏ qua phần này
        // this.totalPages = response.page?.totalPages || 1;
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

  rearrangeOrders(orderList: any[]): any[] {
    let newOrderList = [];

    // 🚀 Dồn dữ liệu từ trang sau lên trang đầu
    for (let i = 0; i < orderList.length; i++) {
        newOrderList.push(orderList[i]);
    }

    return newOrderList;
}




    clearFilter(): void {
      // this.filteredDonhang = this.orders;

    }
    getFilterKey(status: number): string {
      switch (status) {
        case 1: return 'pending';
        case 2: return 'processed';
        case 3: return 'shipping';
        case 4: return 'paid';
        case 5: return 'cancelled';
        default: return '';
      }
    }


    getStatusStyle(status: number) {
      switch (status) {
        case 1: return { 'color': 'red', 'font-weight': 'bold' };  // Chờ Xác Nhận
        case 2: return { 'color': 'blue', 'font-weight': 'bold' }; // Đã Xác Nhận
        case 3: return { 'color': 'rgb(159, 159, 6)', 'font-weight': 'bold' }; // Đang Giao
        case 4: return { 'color': 'white', 'background-color': 'grey', 'font-weight': 'bold' }; // Đã Thanh Toán
        case 5: return { 'color': 'black', 'background-color': 'lightgray', 'font-weight': 'bold' }; // Đã Hủy
        default: return {}; // Trạng thái không xác định
      }
    }
    // Trả về tên trạng thái tiếp theo của đơn hàng
    getNextStatusText(currentStatus: number): string {
      switch (currentStatus) {
          case 1: return 'Đã Xác Nhận'; // Chờ Xác Nhận -> Đã Xác Nhận
          case 2: return 'Đang Giao'; // Đã Xác Nhận -> Đang Giao
          case 3: return 'Đã Thanh Toán hoặc Đã Hủy'; // Đang Giao -> Phải chọn 1 trong 2
          case 4: return 'Đã Hủy'; // Đã Thanh Toán -> Đã Hủy (nếu rollback)
          case 5: return 'Chờ Xác Nhận'; // Đã Hủy -> Chờ Xác Nhận (nếu cần phục hồi)
          default: return 'Không xác định';
      }
  }




// Trả về mã trạng thái tiếp theo của đơn hàng
getNextStatusCode(currentStatus: number): number {
  switch (currentStatus) {
      case 1: return 2; // Chờ Xác Nhận -> Đã Xác Nhận
      case 2: return 3; // Đã Xác Nhận -> Đang Giao
      case 3: return 4; // Đang Giao -> Đã Thanh Toán (hoặc có thể chọn Đã Hủy)
      case 4: return 5; // Đã Thanh Toán -> Đã Hủy (nếu có rollback)
      case 5: return 1; // Đã Hủy -> Chờ Xác Nhận (nếu có phục hồi)
      default: return currentStatus; // Giữ nguyên nếu trạng thái không xác định
  }
}






   // 🔄 Phân trang
   goToPage(p: number) {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
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

  // 🔢 Cập nhật cách lấy danh sách số trang hiển thị
  getPaginationRange(): number[] {
    let range: number[] = [];
    let start = Math.max(0, this.page - 2);
    let end = Math.min(this.totalPages, this.page + 3);

    for (let i = start; i < end; i++) {
      range.push(i);
    }

    console.log('📌 Pagination range:', range); // Debug
    return range;
  }
}


