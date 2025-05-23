import { Component, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddVoucherComponent } from '../add-voucher/add-voucher.component';
import { EditVoucherComponent } from '../edit-voucher/edit-voucher.component';
import { PhieugiamgiaService } from '../../../service/phieugiamgia.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';
import { PercentTransformPipe } from '../../../service/PercentTransformPipe';

@Component({
  selector: 'app-vourcher',
  standalone: true,
  imports: [CommonModule, NgbModalModule, FormsModule, PercentTransformPipe, AddVoucherComponent, EditVoucherComponent],
  templateUrl: './vourcher.component.html',
  styleUrls: ['./vourcher.component.scss']
})
export class VourcherComponent {
  phieuGiamGias: any[] = [];
  filteredPhieuGiamGias: any[] = [];
  page: number = 0;
  size: number = 10;
  totalPages: number = 1;
  filterType: string = 'online';
  statusFilter: string = 'all';
  sortField: string = 'id';
  sortDirection: string = 'desc';

  users: any[] = [];
  selectedVoucher: any = null;
  selectedUserIds: number[] = [];
  filteredUsers: any[] = [];
  userSearchTerm: string = '';
  isSending: boolean = false; // Trạng thái loading khi gửi mã giảm giá

  private searchTimeout: any;

  @ViewChild('sendCouponModal') sendCouponModal!: TemplateRef<any>;

  searchParams: any = {
    maGiamGia: '',
    ngayBatDau: '',
    ngayHetHan: ''
  };

  constructor(
    private phieuGiamGiaService: PhieugiamgiaService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllPhieuGiamGia();
    window.addEventListener('reloadTableAndGoToFirstPage', () => {
      this.page = 0;
      this.loadAllPhieuGiamGia();
      this.scrollToTop();
    });
    window.addEventListener('reloadTable', () => {
      this.loadAllPhieuGiamGia();
      this.scrollToTop();
    });
  }

  filterUsers(): void {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      const keyword = this.userSearchTerm.trim().toLowerCase();
      if (!keyword) {
        this.filteredUsers = [...this.users];
      } else {
        this.filteredUsers = this.users.filter(user =>
          user.id.toString().includes(keyword) ||
          user.hoTen.toLowerCase().includes(keyword) ||
          user.email.toLowerCase().includes(keyword) ||
          user.sdt.toLowerCase().includes(keyword)
        );
      }
      this.cdr.detectChanges();
    }, 300);
  }

  openSendCouponModal(voucher: any): void {
    this.selectedVoucher = voucher;
    this.selectedUserIds = [];
    this.userSearchTerm = '';
    this.isSending = false;

    this.phieuGiamGiaService.getUsers().subscribe({
      next: (users) => {
        if (!users || users.length === 0) {
          Swal.fire({
            icon: 'warning',
            title: 'Cảnh báo!',
            text: 'Không có khách hàng nào để gửi mã giảm giá!',
            confirmButtonText: 'Đóng'
          });
          return;
        }
        this.users = users;
        this.filteredUsers = [...this.users];
        console.log('Danh sách khách hàng:', this.users);
        const modalRef = this.modalService.open(this.sendCouponModal, {
          backdrop: 'static',
          keyboard: false,
          size: 'xl'
        });
        modalRef.result.finally(() => {
          document.body.classList.remove('modal-open');
          document.body.style.overflow = '';
          document.body.style.paddingRight = '';
          this.isSending = false;
          this.cdr.detectChanges();
          this.scrollToTop();
        });
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách khách hàng:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: `Không thể tải danh sách khách hàng: ${error.message || 'Kiểm tra console!'}`,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('reloadTableAndGoToFirstPage', () => {});
    window.removeEventListener('reloadTable', () => {});
  }

  loadAllPhieuGiamGia(): void {
    console.log('📌 Gọi API với:', this.page, this.size, this.statusFilter, this.filterType);
    const params: any = {
      page: this.page.toString(),
      size: this.size.toString(),
      sortField: this.sortField,
      sortDirection: this.sortDirection,
      trangThai: this.statusFilter === 'active' ? '1' : this.statusFilter === 'inactive' ? '0' : null,
      dieuKienapDung: this.filterType === 'online' ? '1' : this.filterType === 'offline' ? '0' : null
    };

    if (this.searchParams.maGiamGia) {
      params.maGiamGia = this.searchParams.maGiamGia;
    }
    if (this.searchParams.ngayBatDau) {
      params.ngayBatDau = new Date(this.searchParams.ngayBatDau).toISOString();
    }
    if (this.searchParams.ngayHetHan) {
      params.ngayHetHan = new Date(this.searchParams.ngayHetHan).toISOString();
    }

    this.phieuGiamGiaService.searchVouchers(params).subscribe({
      next: (response) => {
        console.log('✅ API response:', response);
        if (response.status === 'success') {
          this.phieuGiamGias = response.data || [];
          this.totalPages = response.totalPages || 1;
          this.page = response.currentPage || 0;
          this.filteredPhieuGiamGias = this.sortData(this.phieuGiamGias);
          this.cdr.detectChanges();
        } else {
          this.phieuGiamGias = [];
          this.totalPages = 1;
          this.cdr.detectChanges();
          Swal.fire({
            icon: 'info',
            title: 'Không tìm thấy!',
            text: response.message || 'Không có kết quả phù hợp.',
            confirmButtonText: 'Đóng',
            timer: 1500,
            showConfirmButton: false
          });
        }
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu:', error);
        this.phieuGiamGias = [];
        this.totalPages = 1;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải dữ liệu phiếu giảm giá: ' + (error.message || 'Kiểm tra console!'),
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearchInput(): void {
    const params: any = {
      page: this.page.toString(),
      size: this.size.toString(),
      sortField: this.sortField,
      sortDirection: this.sortDirection,
      trangThai: this.statusFilter === 'active' ? '1' : this.statusFilter === 'inactive' ? '0' : null,
      dieuKienapDung: this.filterType === 'online' ? '1' : this.filterType === 'offline' ? '0' : null
    };

    if (this.searchParams.maGiamGia) {
      params.maGiamGia = this.searchParams.maGiamGia;
    }
    if (this.searchParams.ngayBatDau) {
      params.ngayBatDau = new Date(this.searchParams.ngayBatDau).toISOString();
    }
    if (this.searchParams.ngayHetHan) {
      params.ngayHetHan = new Date(this.searchParams.ngayHetHan).toISOString();
    }

    this.phieuGiamGiaService.searchVouchers(params).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          this.phieuGiamGias = response.data || [];
          this.totalPages = response.totalPages || 1;
          this.page = response.currentPage || 0;
          this.filteredPhieuGiamGias = this.sortData(this.phieuGiamGias);
          this.cdr.detectChanges();
          if (this.phieuGiamGias.length > 0) {
            // Không cần xử lý thêm
          } else {
            Swal.fire({
              icon: 'info',
              title: 'Không tìm thấy!',
              text: response.message || 'Không có kết quả phù hợp.',
              confirmButtonText: 'Đóng',
              timer: 1500,
              showConfirmButton: false
            });
          }
        } else {
          this.phieuGiamGias = [];
          this.totalPages = 1;
          this.cdr.detectChanges();
          Swal.fire({
            icon: 'info',
            title: 'Không tìm thấy!',
            text: response.message || 'Không có kết quả phù hợp.',
            confirmButtonText: 'Đóng',
            timer: 1500,
            showConfirmButton: false
          });
        }
      },
      error: (error) => {
        console.error('❌ Lỗi khi tìm kiếm:', error);
        this.phieuGiamGias = [];
        this.totalPages = 1;
        this.cdr.detectChanges();
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'Có lỗi xảy ra khi tìm kiếm.',
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  clearField(field: string): void {
    this.searchParams[field] = '';
    this.onSearchInput();
  }

  resetSearch(): void {
    this.searchParams = { maGiamGia: '', ngayBatDau: '', ngayHetHan: '' };
    this.page = 0;
    this.statusFilter = 'all';
    this.filterType = 'all';
    this.loadAllPhieuGiamGia();
  }

  filterVouchers(type: string): void {
    this.filterType = type;
    this.page = 0;
    this.loadAllPhieuGiamGia();
  }

  filterByStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusFilter = select.value;
    this.page = 0;
    this.loadAllPhieuGiamGia();
  }

  sortBy(field: string, direction: string): void {
    this.sortField = field;
    this.sortDirection = direction;
    this.loadAllPhieuGiamGia();
  }

  sortData(data: any[]): any[] {
    return data.sort((a, b) => {
      let valueA = a[this.sortField];
      let valueB = b[this.sortField];

      if (this.sortField === 'ngayBatDau' || this.sortField === 'ngayHetHan') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      }

      let comparison = 0;
      if (typeof valueA === 'string') {
        comparison = valueA.localeCompare(valueB);
      } else if (typeof valueA === 'number' || !isNaN(valueA)) {
        comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      } else {
        comparison = 0;
      }
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      this.page = p;
      this.loadAllPhieuGiamGia();
      this.scrollToTop();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadAllPhieuGiamGia();
      this.scrollToTop();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadAllPhieuGiamGia();
      this.scrollToTop();
    }
  }

  getPaginationRange(): { page: number, isEllipsis: boolean }[] {
    const range: { page: number, isEllipsis: boolean }[] = [];
    const maxVisiblePages = 3;

    if (this.totalPages <= 5) {
      for (let i = 0; i < this.totalPages; i++) {
        range.push({ page: i, isEllipsis: false });
      }
    } else {
      range.push({ page: 0, isEllipsis: false });

      let start = Math.max(1, this.page - 1);
      let end = Math.min(this.totalPages - 2, this.page + 1);

      if (end - start + 1 < maxVisiblePages) {
        if (start === 1) {
          end = Math.min(start + maxVisiblePages - 1, this.totalPages - 2);
        } else if (end === this.totalPages - 2) {
          start = Math.max(1, end - maxVisiblePages + 1);
        }
      }

      if (start > 1) {
        range.push({ page: -1, isEllipsis: true });
      }

      for (let i = start; i <= end; i++) {
        range.push({ page: i, isEllipsis: false });
      }

      if (end < this.totalPages - 2) {
        range.push({ page: -1, isEllipsis: true });
      }

      range.push({ page: this.totalPages - 1, isEllipsis: false });
    }

    return range;
  }

  openAddVoucherModal(): void {
    const modalRef = this.modalService.open(AddVoucherComponent, { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.voucherAdded.subscribe((newVoucher: any) => {
      this.page = 0;
      this.loadAllPhieuGiamGia();
      this.scrollToTop();
    });
    modalRef.result.finally(() => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      this.cdr.detectChanges();
      this.scrollToTop();
    });
  }

  openEditVoucherModal(voucher: any): void {
    const modalRef = this.modalService.open(EditVoucherComponent, { backdrop: 'static', keyboard: false });
    modalRef.componentInstance.voucher = { ...voucher };
    modalRef.componentInstance.voucherUpdated.subscribe((updatedVoucher: any) => {
      if (updatedVoucher) {
        const index = this.phieuGiamGias.findIndex((v) => v.id === updatedVoucher.id);
        if (index !== -1) {
          this.phieuGiamGias[index] = { ...updatedVoucher };
          this.filteredPhieuGiamGias = this.sortData(this.phieuGiamGias);
        }
        this.cdr.detectChanges();
      }
    });
    modalRef.result.finally(() => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      this.cdr.detectChanges();
      this.scrollToTop();
    });
  }

  toggleStatus(voucher: any): void {
    const newStatus = voucher.trangThai === 1 ? 0 : 1;

    this.phieuGiamGiaService.updateStatus(voucher.id, newStatus).subscribe({
      next: (response) => {
        if (response.status === 'success') {
          voucher.trangThai = newStatus;
          this.loadAllPhieuGiamGia();
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: `Voucher "${voucher.maGiamGia}" đã được ${newStatus === 1 ? 'kích hoạt' : 'dừng hoạt động'} thành công!`,
            confirmButtonText: 'OK'
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: response.message,
            confirmButtonText: 'Đóng'
          });
        }
      },
      error: (error) => {
        const errorMessage = error.message || 'Kiểm tra console để biết chi tiết!';
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: errorMessage,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  isNotExpired(expiryDate: string): boolean {
    if (!expiryDate) {
      return false;
    }
    const expiry = new Date(expiryDate).getTime();
    if (isNaN(expiry)) {
      return false;
    }
    const now = new Date().getTime();
    return expiry > now;
  }

  shouldShowToggleButton(item: any): boolean {
    const show = item.trangThai === 1 && this.isNotExpired(item.ngayHetHan);
    return show;
  }

  shouldShowActivateButton(item: any): boolean {
    const show = item.trangThai === 0 || item.trangThai === 2 && this.isNotExpired(item.ngayHetHan);
    return show;
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.phieuGiamGias.map(item => ({
      ID: item.id,
      [this.filterType === 'offline' ? 'Phiếu giảm giá' : 'Mã giảm giá']: item.maGiamGia,
      'Giá trị': `${(item.giaTriGiam * 100)}%`,
      'Ngày bắt đầu': new Date(item.ngayBatDau).toLocaleDateString(),
      'Giờ bắt đầu': new Date(item.ngayBatDau).toLocaleTimeString(),
      'Ngày hết hạn': new Date(item.ngayHetHan).toLocaleDateString(),
      'Giờ hết hạn': new Date(item.ngayHetHan).toLocaleTimeString(),
      'Số lượng': item.soLuong,
      'Luồng': item.dieuKienapDung === 0 ? 'Offline' : 'Online',
      'Giá trị tối đa': item.gia_tri_toi_da,
      'Trạng thái': item.trangThai === 1 ? 'Hoạt động' : 'Ngưng'
    })));

    const colWidths = [
      { wch: 5 }, { wch: 15 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 15 }
    ];
    worksheet['!cols'] = colWidths;

    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, 'phieu_giam_gia');
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().toISOString().slice(0, 10) + '.xlsx');
  }

  onUserSelect(userId: number): void {
    const index = this.selectedUserIds.indexOf(userId);
    if (index === -1) {
      this.selectedUserIds.push(userId);
    } else {
      this.selectedUserIds.splice(index, 1);
    }
    console.log('Danh sách ID người dùng đã chọn:', this.selectedUserIds);
  }

  sendCoupon(): void {
    if (this.selectedUserIds.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo!',
        text: 'Vui lòng chọn ít nhất một khách hàng để gửi mã giảm giá!',
        confirmButtonText: 'Đóng'
      });
      return;
    }

    this.isSending = true;
    console.log('Gửi mã giảm giá:', { voucherId: this.selectedVoucher.id, userIds: this.selectedUserIds });
    this.phieuGiamGiaService.sendCoupon(this.selectedVoucher.id, this.selectedUserIds).subscribe({
      next: (response) => {
        console.log('Phản hồi từ API:', response);
        if (response.status === 'success') {
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: response.message || `Đã gửi mã giảm giá đến ${this.selectedUserIds.length} khách hàng!`,
            confirmButtonText: 'OK',
            timer: 1500,
            showConfirmButton: false
          });
          this.modalService.dismissAll();
          this.loadAllPhieuGiamGia();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: response.message || 'Không thể gửi mã giảm giá!',
            confirmButtonText: 'Đóng'
          });
        }
      },
      error: (error) => {
        console.error('Lỗi khi gửi mã giảm giá:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: error.message || 'Có lỗi xảy ra khi gửi mã giảm giá. Kiểm tra console!',
          confirmButtonText: 'Đóng'
        });
      },
      complete: () => {
        this.isSending = false;
        this.cdr.detectChanges();
      }
    });
  }
}