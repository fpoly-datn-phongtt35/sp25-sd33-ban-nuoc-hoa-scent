import { Component,EventEmitter,Output,ChangeDetectorRef,OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import * as XLSX from 'xlsx'; // ✅ Thêm thư viện xuất Excel
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../../service/taikhoan.service';
@Component({
  selector: 'app-customer',
    standalone: true,
    imports: [CommonModule,
      FormsModule, // Thêm FormsModule ở đây

    ],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
  providers: [NgbActiveModal]
})
export class CustomerComponent implements OnInit {
  accounts: any[] = [];
  page: number = 0; // Trang hiện tại
  size: number = 5; // Số bản ghi mỗi trang
  totalPages: number = 10; // Tổng số trang
  searchTerm: string = ''; // Từ khóa tìm kiếm

  constructor(private accountService: AccountService,private modalService: NgbModal) {}


  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    console.log('📌 Gọi API với:', this.page, this.size, this.searchTerm);

    this.accountService.getUserAccounts(this.searchTerm, this.page, this.size).subscribe({
      next: (response) => {
        console.log('✅ API response:', response);
        this.accounts = response.content || [];
        // Cập nhật tổng số trang từ phản hồi API (giả sử backend trả về tổng số trang)
        this.totalPages = response.page?.totalPages || 1;
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu tài khoản:', error);
      }
    });
  }

  onSearch(): void {
    // Khi người dùng thay đổi giá trị trong ô input, gọi lại loadAccounts để tìm kiếm theo từ khóa mới
    console.log('Tìm kiếm với từ khóa:', this.searchTerm);
    this.page = 0;  // Khi tìm kiếm, reset về trang đầu tiên
    this.loadAccounts();
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadAccounts();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadAccounts();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadAccounts();
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
