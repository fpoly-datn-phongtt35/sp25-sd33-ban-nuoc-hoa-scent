import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountService } from '../../service/taikhoan.service';
@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.scss'
})
export class UserAdminComponent{
  accounts: any[] = [];
  page: number = 0; // Trang hiện tại
  size: number = 5; // Số bản ghi mỗi trang
  totalPages: number = 20; // Tổng số trang
  constructor(private accountService: AccountService) {}

  ngOnInit(): void {
    this.loadAccounts();

  }
  loadAccounts(): void {
    console.log('📌 Gọi API với:', this.page, this.size);

    this.accountService.getAccounts(this.page, this.size).subscribe({
      next: (response) => {
        console.log('✅ API response:', response);
        this.accounts = response.content || [];
        this.totalPages = response.page?.totalPages || 1;// Nếu `totalPages` bị null, đặt mặc định là 1
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu khách hàng:', error);
      }
    });

  }
  goToPage(p: number) {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadAccounts();
    }
  }


  prevPage() {
    if (this.page > 0) {
      this.page--;
      this.loadAccounts();
    }
  }

  nextPage() {
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

