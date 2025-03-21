import { Component,EventEmitter,Output,ChangeDetectorRef,OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import * as XLSX from 'xlsx'; // ✅ Thêm thư viện xuất Excel
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators,FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DonhangService } from '../../service/donhang.service';
import { OrderDetaiAdminComponent } from '../order-detai-admin/order-detai-admin.component';
import { HttpClient } from '@angular/common/http';
import { UserDetailOrderComponent } from '../user-detail-order/user-detail-order.component';
@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
  providers: [NgbActiveModal]
})
export class InvoiceComponent implements OnInit {
   orders: any[] = [];
   selectedStatus: number | null = null; // Chọn một kiểu dữ liệu thống nhất
  orderId: number | null = null; 
  filteredDonhang: any[] = [];
  page: number = 0; // Trang hiện tại
  size: number = 15; // Số bản ghi mỗi trang
  totalPages: number = 20; // Tổng số trang
  cancellationReason: string | null = null;
  cancellationReasons: { [key: number]: string } = {};
  showPagination: boolean = false; 
  constructor(private http: HttpClient,private donHangService: DonhangService,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.filteredDonhang = this.orders; 
  }
  confirmStatusChange(orderId: number, newStatus: number) {
    console.log(`🛠️ Nhấn vào nút, đơn hàng ID: ${orderId}, chuyển sang trạng thái: ${newStatus}`);
    
    const nextStatusText = this.getStatusText(newStatus);
    const isConfirmed = confirm(`Bạn có muốn chuyển trạng thái đơn hàng thành "${nextStatusText}" không?`);

    if (isConfirmed) {
        this.updateStatus(orderId, newStatus);
    }
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
          console.log('Status updated successfully', response);
          alert('Trạng thái đơn hàng đã được cập nhật thành công!');

          // Cập nhật trạng thái trong danh sách orders
          const order = this.orders.find(o => o.id === orderId);
          if (order) {
              order.selectedStatus = newStatus;
          }

          // Cập nhật danh sách đã lọc để hiển thị đúng đơn hàng
          this.filterOrders(this.getFilterKey(newStatus));
      },
      error => {
          console.error('Error updating status', error);
          alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      }
  );
}

updateStatusWithReason(orderId: number, newStatus: number, cancellationReason: string) {
  // Gửi yêu cầu PUT với lý do hủy
  const url = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}?trangThai=${newStatus}&lyDoHuy=${encodeURIComponent(cancellationReason)}`;

  this.http.put(url, {}).subscribe(
    response => {
      console.log('Status updated successfully', response);
      alert('Trạng thái đơn hàng đã được cập nhật thành công!');
      // Cập nhật lại giao diện nếu cần
    },
    error => {
      console.error('Error updating status', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
    }
  );
}

  
selectPaymentOption(orderId: number): void {
  const choice = prompt("Chọn hành động tiếp theo: Nhập 1 để chọn 'Đã Thanh Toán', Nhập 2 để chọn 'Đã Hủy'");

  if (choice === '1') {
    this.updateStatus(orderId, 4); // Chuyển sang trạng thái "Đã Thanh Toán"
  } else if (choice === '2') {
    this.requestCancellationReason(orderId); // Yêu cầu lý do hủy và lưu vào DB
  } else {
    alert("Lựa chọn không hợp lệ! Chỉ có thể nhập 1 hoặc 2.");
  }
}
requestCancellationReason(orderId: number): void {
  let cancellationReason: string | null = null;

  // Yêu cầu lý do hủy cho đến khi người dùng nhập hợp lệ
  while (!cancellationReason || cancellationReason.trim() === '') {
    cancellationReason = prompt('Vui lòng nhập lý do hủy đơn hàng:');
    if (cancellationReason && cancellationReason.trim() !== '') {
      this.cancellationReasons[orderId] = cancellationReason; // Lưu lý do hủy vào cancellationReasons
      this.updateStatusWithReason(orderId, 5, cancellationReason); // Gọi API với trạng thái "Đã Hủy" và lý do hủy
      break;
    } else {
      alert('Lý do hủy không được để trống! Vui lòng nhập lại.');
    }
  }
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
    let filteredList: any[] = [];
    switch (status) {
      case 'pending':
        console.log('A')
        filteredList = this.orders.filter(order => order.selectedStatus === 1);
        this.showPagination = false;
        this.selectedStatus = 1;
        console.log('dữ liệu trang chờ xử lý',filteredList)
        break;
      case 'processed':
        console.log('b')
        filteredList = this.orders.filter(order => order.selectedStatus === 2);
        this.showPagination = false;
        this.selectedStatus = 2;
        break;
      case 'shipping':
        console.log('c')
        filteredList = this.orders.filter(order => order.selectedStatus === 3);
        this.showPagination = false;
        this.selectedStatus = 3;
        break;
      case 'paid':
        console.log('d')
        filteredList = this.orders.filter(order => order.selectedStatus === 4);
        this.showPagination = false;
        this.selectedStatus = 4;
        break;
      case 'cancelled':
        console.log('e')
        filteredList = this.orders.filter(order => order.selectedStatus === 5);
        this.showPagination = false;
        this.selectedStatus = 5;
        break;
       
      default:
        console.log('dèault')
        this.showPagination = true;
        this.selectedStatus = null;
        filteredList = [...this.orders]; // Hiển thị tất cả nếu không có trạng thái cụ thể
        break;
    }

    // Dồn sản phẩm từ trang sau lên trang đầu
    this.filteredDonhang = this.rearrangeOrders(filteredList);

    // Đặt lại trang đầu nếu trang hiện tại trống
    if (this.filteredDonhang.length === 0 && this.page > 0) {
      this.page = 0;
      this.loadCustomers(); // Load data again if no orders match
    } else if (status === 'default') {
      this.showPagination = true; // Ensure pagination is enabled when showing all orders
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
          case 1: return 'pending'; // Chờ Xác Nhận
          case 2: return 'processed'; // Đã Xác Nhận
          case 3: return 'shipping'; // Đang Giao
          case 4: return 'paid'; // Đã Thanh Toán
          case 5: return 'cancelled'; // Đã Hủy
          default: return 'all'; // Hiển thị tất cả nếu không xác định
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


