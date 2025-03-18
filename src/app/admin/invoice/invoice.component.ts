import { Component,EventEmitter,Output,ChangeDetectorRef,OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import * as XLSX from 'xlsx'; // ✅ Thêm thư viện xuất Excel
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { DonhangService } from '../../service/donhang.service';
@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invoice.component.html',
  styleUrl: './invoice.component.scss',
  providers: [NgbActiveModal]
})
export class InvoiceComponent implements OnInit {
  orders: any[] = [];
  filteredDonhang: any[] = [];
  page: number = 0; // Trang hiện tại
  size: number = 5; // Số bản ghi mỗi trang
  totalPages: number = 20; // Tổng số trang
  constructor(private donHangService: DonhangService,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadCustomers();
  }
  loadCustomers(){
    console.log('📌 Gọi API với:', this.page, this.size);

    this.donHangService.getDonhang(this.page, this.size).subscribe({
      next: (response: { content: never[]; page: { totalPages: number; }; }) => {
        console.log('✅ API response:', response);
        this.orders = response.content || [];
        this.filteredDonhang = response.content || [];
        this.totalPages = response.page?.totalPages || 1;// Nếu `totalPages` bị null, đặt mặc định là 1
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu khách hàng:', error);
      }
    });
  }
  getStatusText(status: number): string {
    switch (status) {
      case 1: return 'Đã Xác Nhận';
      case 0: return 'Chờ Xác Nhận';
      case -1: return 'Đã Hủy';
      default: return 'Không Xác Định';
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


