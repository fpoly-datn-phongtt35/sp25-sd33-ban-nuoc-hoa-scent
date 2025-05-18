import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../../service/taikhoan.service';
import { HttpClient } from '@angular/common/http';
import { TokenService } from '../../../service/token.service';
import { WebSocketService } from '../../../service/WebSocketService';
import Swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-customer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss']
})
export class CustomerComponent implements OnInit, OnDestroy {
  accounts: any[] = []; // Danh sách tất cả tài khoản
  paginatedAccounts: any[] = []; // Danh sách tài khoản hiển thị theo trang
  page: number = 0;
  size: number = 5; // Số lượng tài khoản mỗi trang
  totalPages: number = 1; // Tổng số trang
  searchTerm: string = '';
  selectedAccountId: number | null = null;
  orders: any[] = [];
  filteredDonhang: any[] = [];
  searchKeyword: string = '';
  selectedTab: string = 'online';
  selectedStatus: number | null = null;
  showMainContent: boolean = true;
  userID: number | null = null;
  tenDangNhap: string | null = null;
  private webSocketSubscription: Subscription | undefined;
  sortDirection: 'asc' | 'desc' = 'desc'; // Hướng sắp xếp: asc (tăng dần), desc (giảm dần)

  keyToStatus: Record<string, number> = {
    pending: 1,
    processed: 2,
    shipping: 3,
    completed: 4,
    cancelled: 5,
    prepaid: 6,
  };

  constructor(
    private accountService: AccountService,
    private http: HttpClient,
    private tokenService: TokenService,
    private webSocketService: WebSocketService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userInfo = this.tokenService.getUserInfo();
    if (userInfo) {
      this.userID = userInfo.UserID;
      this.tenDangNhap = userInfo.sub;
      console.log('UserID:', this.userID);
      console.log('tenDangNhap:', this.tenDangNhap);

      // Load tất cả tài khoản và kết nối WebSocket
      this.loadAllAccounts().then(() => {
        this.webSocketService.connectAdmin();
        this.webSocketSubscription = this.webSocketService.getAdminMessages().subscribe({
          next: (update: any) => this.handleWebSocketUpdate(update),
          error: (error) => console.error('WebSocket subscription error:', error),
          complete: () => console.log('WebSocket subscription completed'),
        });
      });
    } else {
      console.error('User not logged in or token invalid');
      this.showErrorMessage('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }

  // Load tất cả tài khoản từ backend
  async loadAllAccounts(): Promise<void> {
    try {
      let allAccounts: any[] = [];
      let page = 0;
      let response;

      // Lấy tất cả tài khoản qua các trang
      do {
        response = await this.accountService.getUserAccounts(this.searchTerm, page, 100).toPromise();
        allAccounts = allAccounts.concat(response.content || []);
        page++;
      } while (page < (response.page?.totalPages || 1));

      // Lấy số lượng đơn hàng cho mỗi tài khoản
      for (const account of allAccounts) {
        try {
          const orders = await this.accountService.getOrdersByTaiKhoanId(account.id).toPromise();
          account.orderCount = orders.length; // Thêm thuộc tính orderCount
        } catch (error) {
          console.error(`Lỗi khi lấy đơn hàng cho tài khoản ${account.id}:`, error);
          account.orderCount = 0;
        }
      }

      // Sắp xếp theo số lượng đơn hàng
      this.accounts = allAccounts.sort((a, b) => {
        return this.sortDirection === 'desc' 
          ? b.orderCount - a.orderCount 
          : a.orderCount - b.orderCount;
      });

      // Cập nhật phân trang
      this.updatePagination();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách tài khoản:', error);
      this.showErrorMessage('Không thể tải danh sách khách hàng.');
    }
  }

  // Cập nhật dữ liệu phân trang
  updatePagination(): void {
    this.totalPages = Math.ceil(this.accounts.length / this.size) || 1;
    this.page = Math.min(this.page, this.totalPages - 1); // Đảm bảo trang hợp lệ
    const start = this.page * this.size;
    this.paginatedAccounts = this.accounts.slice(start, start + this.size);
    this.cdRef.detectChanges();
  }

  // Chuyển đổi hướng sắp xếp
  toggleSortDirection(): void {
    this.sortDirection = this.sortDirection === 'desc' ? 'asc' : 'desc';
    this.page = 0; // Reset về trang đầu tiên khi thay đổi sắp xếp
    this.loadAllAccounts(); // Tải lại dữ liệu với sắp xếp mới
  }

  ngOnDestroy(): void {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
  }

  private handleWebSocketUpdate(update: any): void {
    console.log('Received WebSocket update:', update);
    if (!update || !update.idDonHang || update.trangThai === undefined) {
      console.error('Invalid WebSocket update:', update);
      return;
    }

    const { idDonHang, trangThai, isNewOrder } = update;

    if (isNewOrder) {
      this.fetchOrderDetails(idDonHang);
    } else {
      const orderToUpdate = this.orders.find((order) => order.id === idDonHang);
      if (orderToUpdate) {
        orderToUpdate.trangThai = trangThai;
        this.applySearch();
        this.cdRef.detectChanges();
        Swal.fire({
          title: 'Cập nhật trạng thái',
          text: `Đơn hàng ${idDonHang} đã được cập nhật thành ${this.getStatusText(trangThai)}`,
          icon: 'info',
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  }

  private fetchOrderDetails(orderId: number): void {
    this.http.get(`http://localhost:8080/rest/don-hang/${orderId}`).subscribe({
      next: (orderDetails: any) => {
        console.log('Fetched order details:', orderDetails);
        if (orderDetails.taiKhoan?.id === this.selectedAccountId) {
          this.orders.unshift({ ...orderDetails, trangThai: orderDetails.trangThai });
          this.orders.sort((a, b) => b.id - a.id);
          this.applySearch();
          this.cdRef.detectChanges();
          Swal.fire({
            title: 'Đơn hàng mới',
            text: `Đơn hàng ${orderId} đã được tạo!`,
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        }
      },
      error: (error) => {
        console.error('Error fetching order details:', error);
        this.showErrorMessage('Không thể tải thông tin đơn hàng mới.');
      },
    });
  }

  private getStatusText(status: number): string {
    switch (status) {
      case 1:
        return 'Chờ xác nhận';
      case 2:
        return 'Đã xác nhận';
      case 3:
        return 'Đang giao';
      case 4:
        return 'Hoàn thành';
      case 5:
        return 'Đã hủy';
      case 6:
        return 'Đã thanh toán';
      default:
        return 'Không xác định';
    }
  }

  loadAccounts(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📌 Gọi API với:', this.page, this.size, this.searchTerm);
      this.accountService.getUserAccounts(this.searchTerm, this.page, this.size).subscribe({
        next: (response) => {
          console.log('✅ API response:', response);
          this.accounts = response.content || [];
          this.totalPages = response.page?.totalPages || 1;
          resolve();
        },
        error: (error) => {
          console.error('❌ Lỗi khi lấy dữ liệu tài khoản:', error);
          this.showErrorMessage('Không thể tải danh sách khách hàng.');
          reject(error);
        },
      });
    });
  }

  // Tìm kiếm tài khoản
  onSearch(): void {
    console.log('Tìm kiếm với từ khóa:', this.searchTerm);
    this.page = 0;
    this.loadAllAccounts();
  }

  // Chuyển đến trang cụ thể
  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('Chuyển đến trang:', p);
      this.page = p;
      this.updatePagination();
    }
  }

  // Trang trước
  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.updatePagination();
    }
  }

  // Trang sau
  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.updatePagination();
    }
  }

  // Tạo dải phân trang
  getPaginationRange(): number[] {
    let range: number[] = [];
    let start = Math.max(0, this.page - 2);
    let end = Math.min(this.totalPages, this.page + 3);
    for (let i = start; i < end; i++) {
      range.push(i);
    }
    console.log('Phạm vi phân trang:', range);
    return range;
  }

  // Xem danh sách đơn hàng của tài khoản
  viewOrders(id: number): void {
    this.selectedAccountId = id;
    this.showMainContent = false;
    this.accountService.getOrdersByTaiKhoanId(id).subscribe({
      next: (orders) => {
        this.orders = orders.map((order: any) => ({
          ...order,
          trangThai: order.trangThai,
        }));
        this.applySearch();
      },
      error: (error) => {
        console.error('Lỗi khi lấy danh sách đơn hàng:', error);
        this.orders = [];
        this.filteredDonhang = [];
        this.showErrorMessage('Không thể tải danh sách đơn hàng.');
      },
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
      filtered = filtered.filter((order) =>
        order.tenNguoiNhanHang?.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        order.sdtNguoiNhan?.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        order.id.toString().includes(this.searchKeyword)
      );
    }
    filtered = filtered.filter((order) => {
      if (this.selectedTab === 'online') {
        return order.luongBan === 1;
      } else {
        return order.luongBan === 0;
      }
    });
    if (this.selectedStatus !== null) {
      filtered = filtered.filter((order) => order.trangThai === this.selectedStatus);
    }
    this.filteredDonhang = filtered;
    this.cdRef.detectChanges();
  }

  switchTab(tab: string): void {
    this.selectedTab = tab;
    this.selectedStatus = null;
    this.applySearch();
  }

  filterOrders(status: string): void {
    switch (status) {
      case 'default':
        this.selectedStatus = null;
        break;
      case 'pending':
        this.selectedStatus = 1;
        break;
      case 'processed':
        this.selectedStatus = 2;
        break;
      case 'shipping':
        this.selectedStatus = 3;
        break;
      case 'completed':
        this.selectedStatus = 4;
        break;
      case 'cancelled':
        this.selectedStatus = 5;
        break;
      case 'prepaid':
        this.selectedStatus = 6;
        break;
    }
    this.applySearch();
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

  confirmStatusChange(order: any): void {
    const isCK = order.phuongThucThanhToan?.toLowerCase().includes('ck');
    const nextStatus = this.getNextStatusCode(order.trangThai, isCK);
    const nextStatusText = this.getNextStatusText(order.trangThai, isCK);

    if (order.trangThai === 3) {
      this.selectShippingOption(order.id);
      return;
    }

    Swal.fire({
      title: 'Xác nhận chuyển trạng thái',
      text: `Chuyển trạng thái đơn hàng ${this.formatOrderId(order)} sang "${nextStatusText}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        this.updateStatus(order.id, nextStatus);
      }
    });
  }

  selectShippingOption(orderId: number): void {
    Swal.fire({
      title: 'Chọn hành động tiếp theo',
      input: 'select',
      inputOptions: {
        '1': '✅ Đã Nhận Hàng (Hoàn thành)',
        '2': '❌ Hủy Đơn (Khách không nhận)',
      },
      inputPlaceholder: 'Chọn hành động',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const choice = result.value;
        if (choice === '1') {
          this.updateStatus(orderId, 4);
        } else if (choice === '2') {
          this.requestCancellationReason(orderId);
        } else {
          this.showErrorMessage('Vui lòng chọn một hành động hợp lệ.');
        }
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
    }).then((result) => {
      if (result.isConfirmed && result.value.trim() !== '') {
        this.updateStatusWithReason(orderId, 5, result.value);
      } else if (result.isConfirmed) {
        this.showErrorMessage('Lý do hủy không được để trống! Vui lòng nhập lại.');
      }
    });
  }

  updateStatus(orderId: number, newStatus: number): void {
    if (!this.userID || !this.tenDangNhap) {
      this.showErrorMessage('User not logged in or token invalid.');
      return;
    }

    const params = {
      trangThai: newStatus,
      userID: this.userID,
      tenDangNhap: this.tenDangNhap,
    };

    const url = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}`;
    this.http.put(url, {}, { params }).subscribe({
      next: (response) => {
        const order = this.orders.find((o) => o.id === orderId);
        if (order) {
          order.trangThai = newStatus;
        }
        this.applySearch();
        Swal.fire('Cập nhật thành công!', `Đơn hàng ${this.formatOrderId({ id: orderId })} đã được cập nhật.`, 'success');
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.showErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      },
    });
  }

  updateStatusWithReason(orderId: number, newStatus: number, cancellationReason: string): void {
    if (!this.userID || !this.tenDangNhap) {
      this.showErrorMessage('User not logged in or token invalid.');
      return;
    }

    const params = {
      trangThai: newStatus,
      userID: this.userID,
      tenDangNhap: this.tenDangNhap,
      lyDoHuy: cancellationReason,
    };

    const url = `http://localhost:8080/rest/don-hang/capnhat-trangthai/${orderId}`;
    this.http.put(url, {}, { params }).subscribe({
      next: (response) => {
        const order = this.orders.find((o) => o.id === orderId);
        if (order) {
          order.trangThai = newStatus;
          order.lyDoHuy = cancellationReason;
        }
        this.applySearch();
        Swal.fire('Thành công', `Đơn hàng ${this.formatOrderId({ id: orderId })} đã được hủy!`, 'success');
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.showErrorMessage('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng.');
      },
    });
  }

  showErrorMessage(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Lỗi',
      text: message,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
    });
  }

  getNextStatusCode(currentStatus: number, isCK: boolean): number {
    switch (currentStatus) {
      case 1:
        return isCK ? 6 : 2;
      case 2:
        return 3;
      case 3:
        return 4;
      case 6:
        return 3;
      default:
        return currentStatus;
    }
  }

  getNextStatusText(currentStatus: number, isCK: boolean): string {
    switch (currentStatus) {
      case 1:
        return isCK ? 'Đã Thanh Toán' : 'Đã Xác Nhận';
      case 2:
        return 'Đang Giao';
      case 3:
        return 'Hoàn Thành';
      case 6:
        return 'Đang Giao';
      default:
        return 'Không xác định';
    }
  }

  async exportToExcel(): Promise<void> {
    const exportData: any[] = [];
    let index = 0;
    let allAccounts: any[] = [];

    // Define headers for width calculation
    const headers = {
      'STT': 'STT',
      'Tên người dùng': 'Tên người dùng',
      'Username': 'Username',
      'Email': 'Email',
      'SDT': 'SDT',
      'Địa chỉ': 'Địa chỉ',
      'Số lượng đơn hàng': 'Số lượng đơn hàng',
      'Tổng tiền': 'Tổng tiền'
    };

    try {
      // Fetch the first page to get totalPages
      const firstResponse = await this.accountService.getUserAccounts('', 0, 100).toPromise();
      const totalPages = firstResponse.page?.totalPages || 1;
      allAccounts = firstResponse.content || [];

      // Fetch remaining pages if totalPages > 1
      if (totalPages > 1) {
        for (let page = 1; page < totalPages; page++) {
          const response = await this.accountService.getUserAccounts('', page, 100).toPromise();
          allAccounts = allAccounts.concat(response.content || []);
        }
      }

      for (const account of allAccounts) {
        try {
          const orders = await this.accountService.getOrdersByTaiKhoanId(account.id).toPromise();
          // Count completed orders (trangThai = 4) and calculate total revenue
          const completedOrders = orders.filter((order: any) => order.trangThai === 4);
          const orderCount = completedOrders.length;
          const totalRevenue = completedOrders.reduce((total: number, order: any) => {
            return total + this.calculateTotal(order.chiTietDonHangs);
          }, 0);

          exportData.push({
            'STT': ++index,
            'Tên người dùng': account.hoTen || 'Không xác định',
            'Username': account.tenDangNhap || 'Không xác định',
            'Email': account.email || 'Không xác định',
            'SDT': account.sdt || 'Không xác định',
            'Địa chỉ': account.diaChi || 'Không xác định',
            'Số lượng đơn hàng': orderCount,
            'Tổng tiền': totalRevenue.toLocaleString('vi-VN') + ' VND'
          });
        } catch (error) {
          console.error(`❌ Lỗi khi lấy đơn hàng cho tài khoản ${account.id}:`, error);
          exportData.push({
            'STT': ++index,
            'Tên người dùng': account.hoTen || 'Không xác định',
            'Username': account.tenDangNhap || 'Không xác định',
            'Email': account.email || 'Không xác định',
            'SDT': account.sdt || 'Không xác định',
            'Địa chỉ': account.diaChi || 'Không xác định',
            'Số lượng đơn hàng': 0,
            'Tổng tiền': '0 VND'
          });
        }
      }
    } catch (error) {
      console.error('❌ Lỗi khi lấy toàn bộ tài khoản:', error);
      this.showErrorMessage('Không thể xuất danh sách khách hàng.');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet([headers, ...exportData], { skipHeader: true });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Khách Hàng');

    // Calculate column widths based on content and headers
    const colWidths = Object.keys(headers).reduce((widths, key, i) => {
      // Get max length for this column (data + header)
      const maxLength = exportData.reduce((max, row) => {
        const value = row[key] ? row[key].toString() : '';
        return Math.max(max, value.length);
      }, key.length); // Compare with header length
      // Convert to Excel width units (approx. 1 char = 1 unit, with padding)
      const width = Math.min(Math.max(maxLength + 2, 10), 80); // Min 10, max 80
      widths[i] = width;
      return widths;
    }, [] as number[]);
    worksheet['!cols'] = colWidths.map(w => ({ wch: w }));

    // Add headers styling
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

    XLSX.writeFile(workbook, 'Danh_Sach_Khach_Hang.xlsx');
  }
}