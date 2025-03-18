import { Component,EventEmitter,Output,ChangeDetectorRef,OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import * as XLSX from 'xlsx'; // ✅ Thêm thư viện xuất Excel
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators,FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DonhangService } from '../../service/donhang.service';
import { OrderDetaiAdminComponent } from '../order-detai-admin/order-detai-admin.component';
import { HttpClient } from '@angular/common/http';
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
  constructor(private http: HttpClient,private donHangService: DonhangService,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadCustomers();
  }
  updateStatus(orderId: number, newStatus: number) {
    const url = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}?trangThai=${newStatus}`;
    this.http.put(url, {}).subscribe(
      response => {
        console.log('Status updated successfully', response);
        alert('Trạng thái đơn hàng đã được cập nhật thành công!');
        // Tùy theo cấu trúc của ứng dụng, bạn có thể cần cập nhật giao diện người dùng ở đây
      },
      error => {
        console.error('Error updating status', error);
        alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      }
    );
  }
  
  
  openDetailModal(order: any) {
    const modalRef = this.modalService.open(OrderDetaiAdminComponent, { size: 'lg' });
    modalRef.componentInstance.order = order; // Truyền đơn hàng vào component modal
  }
  loadCustomers(){
    
      this.donHangService.getDonhang(this.page, this.size).subscribe({
        next: (response) => {
          this.orders = response.content.map((order: { trangThai: any; }) => ({
            ...order,
            selectedStatus: order.trangThai // Khởi tạo selectedStatus bằng trạng thái hiện tại của đơn hàng
          }));
          this.filteredDonhang = [...this.orders];
          this.totalPages = response.page?.totalPages || 1;
        },
        error: (error: any) => console.error('Error loading orders', error)
      });
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


