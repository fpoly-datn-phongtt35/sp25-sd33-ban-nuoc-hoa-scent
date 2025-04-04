import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../service/taikhoan.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AddStaffAccountComponent } from '../add-staff-account/add-staff-account.component';
import {AccountStaffUpdateComponent} from '../account-staff-update/account-staff-update.component';
import { TokenService } from '../../../service/token.service'; // Import TokenService

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss']
})
export class UserAdminComponent implements OnInit {
  accounts: any[] = [];
  page: number = 0;
  size: number = 5;
  totalPages: number = 10;
  searchTerm: string = '';
  userRole: string | null = null; // Lưu vai trò người dùng

  constructor(
    private accountService: AccountService,
    private router: Router,
    private modalService: NgbModal,
    private tokenService: TokenService // Inject TokenService
  ) {}

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole(); // Lấy userRole từ TokenService
    console.log('Vai trò trong UserAdminComponent:', this.userRole);
    this.loadAccounts();
  }

  loadAccounts(): void {
    console.log('📌 Gọi API với:', this.page, this.size, this.searchTerm);
    this.accountService.getStaffAccounts(this.searchTerm, this.page, this.size).subscribe({
      next: (response) => {
        console.log('✅ API response:', response);
        this.accounts = response.content || [];
        this.totalPages = response.page?.totalPages || 1;
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu tài khoản:', error);
      }
    });
  }

  onSearch(): void {
    console.log('Tìm kiếm với từ khóa:', this.searchTerm);
    this.page = 0;
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

  getPaginationRange(): number[] {
    let range: number[] = [];
    let start = Math.max(0, this.page - 2);
    let end = Math.min(this.totalPages, this.page + 3);
    for (let i = start; i < end; i++) {
      range.push(i);
    }
    console.log('📌 Pagination range:', range);
    return range;
  }

  openAddModal(): void {
    const modalRef = this.modalService.open(AddStaffAccountComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.accountAdded.subscribe((newAccount: any) => {
      console.log('🎉 Tài khoản mới:', newAccount);
      this.loadAccounts();
      this.accounts.unshift(newAccount);
    });
  }

  openUpdateModal(account: any): void {
    const modalRef = this.modalService.open(AccountStaffUpdateComponent, {
      centered: true,
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.account = account; // Truyền dữ liệu tài khoản vào modal

    modalRef.componentInstance.accountUpdated.subscribe((updatedAccount: any) => {
      console.log('🎉 Tài khoản đã cập nhật:', updatedAccount);
      this.loadAccounts(); // Tải lại danh sách sau khi cập nhật
    });
  }

  resetPassword(email: string): void {
    if (confirm('Bạn có chắc chắn muốn cấp lại mật khẩu cho tài khoản này?')) {
      this.accountService.resetPassword(email).subscribe({
        next: (response) => {
          console.log('✅ Cấp lại mật khẩu thành công:', response);
          alert('Mật khẩu mới đã được gửi tới email: ' + email);
        },
        error: (error) => {
          console.error('❌ Lỗi khi cấp lại mật khẩu:', error);
          alert('Cấp lại mật khẩu thất bại. Vui lòng thử lại.');
        }
      });
    }
  }

  deleteAccount(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      alert('Chưa triển khai chức năng xóa tài khoản. ID: ' + id);
      // Thêm logic gọi API xóa tài khoản nếu cần
    }
  }

  viewAccount(id: number): void {
    alert('Chưa triển khai chức năng xem chi tiết tài khoản. ID: ' + id);
    // Thêm logic xem chi tiết tài khoản nếu cần
  }
}
