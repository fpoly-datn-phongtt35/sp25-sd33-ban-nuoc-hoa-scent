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
import * as XLSX from 'xlsx';

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
  allAccounts: any[] = []; // Danh sách toàn bộ tài khoản
  page: number = 0;
  size: number = 5;
  totalPages: number = 15;
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
    this.loadAllAccounts(); // Tải toàn bộ tài khoản
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
        Swal.fire('Lỗi', 'Không thể tải danh sách nhân viên.', 'error');
      }
    });
  }

  loadAllAccounts(): void {
    // Tải toàn bộ tài khoản với size lớn để lấy hết dữ liệu
    this.accountService.getStaffAccounts('', 0, 1000).subscribe({
      next: (response) => {
        console.log('✅ Tải toàn bộ tài khoản:', response);
        this.allAccounts = response.content || [];
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy toàn bộ tài khoản:', error);
        Swal.fire('Lỗi', 'Không thể tải danh sách toàn bộ nhân viên.', 'error');
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

    modalRef.componentInstance.accounts = this.allAccounts; // Truyền toàn bộ danh sách

    modalRef.componentInstance.accountAdded.subscribe((newAccount: any) => {
      console.log('🎉 Tài khoản mới:', newAccount);
      this.loadAccounts();
      this.loadAllAccounts(); // Cập nhật lại toàn bộ danh sách
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
    modalRef.componentInstance.accounts = this.allAccounts; // Đảm bảo truyền danh sách đầy đủ
  
    modalRef.componentInstance.accountUpdated.subscribe((updatedAccount: any) => {
      console.log('🎉 Tài khoản đã cập nhật:', updatedAccount);
      this.loadAccounts();
      this.loadAllAccounts(); // Cập nhật lại danh sách
    });
  }

  resetPassword(email: string): void {
    Swal.fire({
      title: 'Xác nhận',
      text: `Bạn có chắc chắn muốn cấp lại mật khẩu cho ${email}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.accountService.resetPassword(email).subscribe({
          next: (response) => {
            console.log('✅ Cấp lại mật khẩu thành công:', response);
            Swal.fire({
              title: 'Thành công',
              text: `Mật khẩu mới đã được gửi tới email: ${email}`,
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('❌ Lỗi khi cấp lại mật khẩu:', error);
            Swal.fire('Lỗi', 'Cấp lại mật khẩu thất bại. Vui lòng thử lại.', 'error');
          }
        });
      }
    });
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
        Swal.fire('Lỗi', 'Không thể tải danh sách đơn hàng.', 'error');
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
    const normalized = method?.toLowerCase();
    switch (normalized) {
      case 'tm':
      case 'tienmat':
        return 'Tiền mặt';
      case 'ck':
        return 'Chuyển khoản';
      default:
        return 'Không rõ';
    }
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
            <td style="padding: 8px;">${item.spct?.sanPham?.tenSanPham || 'Không có'}</td>
            <td style="padding: 8px;">${item.soLuong || 0}</td>
            <td style="padding: 8px;">${(item.donGia || 0).toLocaleString('vi-VN')} VNĐ</td>
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

  async exportToExcel(): Promise<void> {
    const exportData: any[] = [];
    let index = 0;

    const headers = {
      'STT': 'STT',
      'Tên người dùng': 'Tên người dùng',
      'Username': 'Username',
      'Email': 'Email',
      'SDT': 'SDT',
      'Trạng thái': 'Trạng thái',
      'Số lượng đơn hàng': 'Số lượng đơn hàng',
      'Tổng tiền': 'Tổng tiền'
    };

    try {
      for (const account of this.allAccounts) {
        try {
          const orders = await this.accountService.getOrdersByTaiKhoanId(account.id).toPromise();
          const completedOrders = orders.filter((order: any) => order.trangThai === 4);
          const orderCount = completedOrders.length;
          const totalRevenue = completedOrders.reduce((total: number, order: any) => {
            return total + this.calculateTotal(order.chiTietDonHangs);
          }, 0);

          exportData.push({
            'STT': ++index,
            'Tên người dùng': account.hoTen || 'N/A',
            'Username': account.tenDangNhap || 'N/A',
            'Email': account.email || 'N/A',
            'SDT': account.sdt || 'N/A',
            'Trạng thái': account.trangThai === 1 ? 'Đang làm' : 'Nghỉ làm',
            'Số lượng đơn hàng': orderCount,
            'Tổng tiền': totalRevenue.toLocaleString('vi-VN') + ' VND'
          });
        } catch (error) {
          console.error(`❌ Lỗi khi lấy đơn hàng cho tài khoản ${account.id}:`, error);
          exportData.push({
            'STT': ++index,
            'Tên người dùng': account.hoTen || 'N/A',
            'Username': account.tenDangNhap || 'N/A',
            'Email': account.email || 'N/A',
            'SDT': account.sdt || 'N/A',
            'Trạng thái': account.trangThai === 1 ? 'Đang làm' : 'Nghỉ làm',
            'Số lượng đơn hàng': 0,
            'Tổng tiền': '0 VND'
          });
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi xuất dữ liệu:', error);
      Swal.fire('Lỗi', 'Không thể xuất danh sách nhân viên.', 'error');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet([headers, ...exportData], { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Nhân Viên');

    const colWidths = Object.keys(headers).reduce((widths, key, i) => {
      const maxLength = exportData.reduce((max, row) => {
        const value = row[key] ? row[key].toString() : '';
        return Math.max(max, value.length);
      }, key.length);
      const width = Math.min(Math.max(maxLength + 2, 10), 80);
      widths[i] = width;
      return widths;
    }, [] as number[]);
    worksheet['!cols'] = colWidths.map(w => ({ wch: w }));

    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) {
        cell.s = {
          font: { bold: true },
          alignment: { horizontal: 'center' },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          }
        };
      }
    }

    XLSX.writeFile(workbook, 'Danh_Sach_Nhan_Vien.xlsx');
  }
}