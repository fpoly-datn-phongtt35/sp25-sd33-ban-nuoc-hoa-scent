import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../service/taikhoan.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { AddStaffAccountComponent } from '../add-staff-account/add-staff-account.component';
import { AccountStaffUpdateComponent } from '../account-staff-update/account-staff-update.component';
import { TokenService } from '../../../service/token.service';
import Swal from 'sweetalert2';

// Thêm interface Account để fix lỗi TS2304
interface Account {
  id: number;
  hoTen: string;
  tenDangNhap: string;
  email: string;
  sdt: string;
  trangThai: number;
}

@Component({
  selector: 'app-user-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, AddStaffAccountComponent, AccountStaffUpdateComponent],
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.scss']
})
export class UserAdminComponent implements OnInit {
  accounts: any[] = [];
  page: number = 0;
  size: number = 5;
  totalPages: number = 10;
  searchTerm: string = '';
  userRole: string | null = null;
  selectedAccountId: number | null = null;
  orders: any[] = [];
  filteredDonhang: any[] = [];
  searchKeyword: string = '';
  selectedTab: string = 'online';
  selectedStatus: number | null = null;
  showMainContent: boolean = true;

  constructor(
    private accountService: AccountService,
    private router: Router,
    private modalService: NgbModal,
    private tokenService: TokenService
  ) {}

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole();
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

    modalRef.componentInstance.account = account;

    modalRef.componentInstance.accountUpdated.subscribe((updatedAccount: any) => {
      console.log('🎉 Tài khoản đã cập nhật:', updatedAccount);
      this.loadAccounts();
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

  toggleStatus(account: Account): void {
    const newStatus = account.trangThai === 1 ? 0 : 1;
    const statusText = newStatus === 1 ? 'Tiếp tục làm' : 'Nghỉ làm';

    Swal.fire({
      title: 'Xác nhận',
      text: `Đổi trạng thái của ${account.hoTen} thành "${statusText}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.accountService.setTrangThaiByIdTaiKhoan(account.id, newStatus).subscribe({
          next: (updatedAccount: Account) => {
            account.trangThai = newStatus;
            Swal.fire({
              title: 'Thành công',
              text: `Trạng thái của ${account.hoTen} đã đổi thành "${statusText}"`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('Lỗi đổi trạng thái:', error);
            Swal.fire('Lỗi', 'Đổi trạng thái thất bại. Vui lòng thử lại!', 'error');
          }
        });
      }
    });
  }

  viewOrders(id: number): void {
    this.selectedAccountId = id;
    this.showMainContent = false;
    this.accountService.getOrdersByTaiKhoanId(id).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applySearch();
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy danh sách đơn hàng:', error);
        this.orders = [];
        this.filteredDonhang = [];
      }
    });
  }

  closeOrders(): void {
    this.selectedAccountId = null;
    this.orders = [];
    this.filteredDonhang = [];
    this.searchKeyword = '';
    this.selectedTab = 'online';
    this.selectedStatus = null;
    this.showMainContent = true;
  }

  applySearch(): void {
    let filtered = this.orders;
    if (this.searchKeyword) {
      filtered = filtered.filter(order =>
        order.tenNguoiNhanHang?.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        order.sdtNguoiNhan?.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        order.id.toString().includes(this.searchKeyword)
      );
    }
    this.filteredDonhang = filtered;
  }

  formatOrderId(order: any): string {
    return 'DH' + order.id.toString().padStart(4, '0');
  }

  getPaymentMethod(method: string): string {
    return method === 'tm' ? 'Tiền mặt' : 'Chuyển khoản';
  }

  calculateTotal(chiTietDonHangs: any[]): number {
    if (!chiTietDonHangs || chiTietDonHangs.length === 0) return 0;
    return chiTietDonHangs.reduce((total, item) => total + (item.soLuong * item.donGia), 0);
  }

  onRowClick(order: any): void {
    let htmlContent = '<div style="text-align: left;">';
    if (order.chiTietDonHangs && order.chiTietDonHangs.length > 0) {
      htmlContent += '<h5>Danh sách sản phẩm</h5>';
      htmlContent += `
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 1px solid #ddd;">
              <th style="padding: 8px;">STT</th>
              <th style="padding: 8px;">Tên sản phẩm</th>
              <th style="padding: 8px;">Số lượng</th>
              <th style="padding: 8px;">Đơn giá</th>
              <th style="padding: 8px;">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
      `;
      order.chiTietDonHangs.forEach((item: any, index: number) => {
        htmlContent += `
          <tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px;">${index + 1}</td>
            <td style="padding: 8px;">${item.spct.sanPham.tenSanPham || 'Không có'}</td>
            <td style="padding: 8px;">${item.soLuong || 0}</td>
            <td style="padding: 8px;">${(item.spct.donGia || 0).toLocaleString('vi-VN')} VNĐ</td>
            <td style="padding: 8px;">${((item.soLuong || 0) * (item.donGia || 0)).toLocaleString('vi-VN')} VNĐ</td>
          </tr>
        `;
      });
      htmlContent += `
          </tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="padding: 8px; text-align: right;"><strong>Tổng tiền:</strong></td>
              <td style="padding: 8px;">${this.calculateTotal(order.chiTietDonHangs).toLocaleString('vi-VN')} VNĐ</td>
            </tr>
          </tfoot>
        </table>
      `;
    } else {
      htmlContent += '<p>Không có sản phẩm nào trong đơn hàng này.</p>';
    }
    htmlContent += '</div>';

    Swal.fire({
      title: 'Chi tiết đơn hàng',
      html: htmlContent,
      width: 800,
      showCloseButton: true,
      showConfirmButton: true,
      confirmButtonText: 'Đóng',
      customClass: {
        popup: 'swal2-order-detail'
      }
    });
  }
}
