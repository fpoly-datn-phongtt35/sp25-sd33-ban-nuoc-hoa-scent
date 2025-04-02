import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Đảm bảo import FormsModule
import { AccountService } from '../../../service/taikhoan.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AddStaffAccountComponent } from '../add-staff-account/add-staff-account.component';

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule,
    FormsModule, // Thêm FormsModule ở đây

  ],

  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss']
})
export class UserAdminComponent {
  accounts: any[] = [];
  page: number = 0; // Trang hiện tại
  size: number = 5; // Số bản ghi mỗi trang
  totalPages: number = 10; // Tổng số trang
  searchTerm: string = ''; // Từ khóa tìm kiếm

  constructor(private accountService: AccountService,private router: Router,private modalService: NgbModal) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    console.log('📌 Gọi API với:', this.page, this.size, this.searchTerm);

    this.accountService.getStaffAccounts(this.searchTerm, this.page, this.size).subscribe({
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
  openAddModal(){
    const modalRef = this.modalService.open(AddStaffAccountComponent, {
      centered: true, // ✅ canh giữa
      backdrop: 'static', keyboard: false });

        // Nhận dữ liệu khách hàng mới từ modal
        modalRef.componentInstance.accountAdded.subscribe((newproduct: any) => {
          console.log('🎉 Khách hàng mới:', newproduct);
          this.loadAccounts();
          this.accounts.unshift(newproduct); // ✅ Thêm vào đầu danh sách
        });
      }
}
