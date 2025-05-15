import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { AddVoucherComponent } from '../add-voucher/add-voucher.component';
import { EditVoucherComponent } from '../edit-voucher/edit-voucher.component';
import { PhieugiamgiaService } from '../../../service/phieugiamgia.service';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vourcher',
  standalone: true,
  imports: [CommonModule, NgbModalModule, FormsModule],
  templateUrl: './vourcher.component.html',
  styleUrls: ['./vourcher.component.scss']
})
export class VourcherComponent {
  phieuGiamGias: any[] = [];
  filteredPhieuGiamGias: any[] = [];
  page: number = 0;
  size: number = 5;
  totalPages: number = 1;
  filterType: string = 'online';
  statusFilter: string = 'all';
  sortField: string = '';
  sortDirection: string = 'asc';

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
  }

  loadAllPhieuGiamGia(): void {
    console.log('📌 Gọi API với:', this.page, this.size);
    this.phieuGiamGiaService.getAllPhieuGiamGia(this.page, this.size).subscribe({
      next: (response) => {
        console.log('✅ API response:', response);
        this.phieuGiamGias = response.content || [];
        this.totalPages = response.page?.totalPages || 1;
        this.applyFilter();
      },
      error: (error) => {
        console.error('❌ Lỗi khi lấy dữ liệu:', error);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể tải dữ liệu phiếu giảm giá: ' + (error.message || 'Kiểm tra console!'),
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  onSearchInput(): void {
    const params: any = {
      page: this.page.toString(),
      size: this.size.toString()
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
          this.applyFilter();
          if (this.phieuGiamGias.length > 0) {
            Swal.fire({
              icon: 'success',
              title: 'Thành công!',
              text: 'Đã tìm thấy ' + this.phieuGiamGias.length + ' kết quả.',
              confirmButtonText: 'OK',
              timer: 1500,
              showConfirmButton: false
            });
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
    this.searchParams = {
      maGiamGia: '',
      ngayBatDau: '',
      ngayHetHan: ''
    };
    this.page = 0;
    this.loadAllPhieuGiamGia();
  }

  filterVouchers(type: string): void {
    this.filterType = type;
    this.page = 0;
    this.applyFilter();
  }

  filterByStatus(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.statusFilter = select.value;
    this.page = 0;
    this.applyFilter();
  }

  applyFilter(): void {
    console.log('📌 Dữ liệu trước khi lọc:', this.phieuGiamGias);
    let filtered = [...this.phieuGiamGias];

    if (this.filterType === 'online') {
      filtered = filtered.filter(item => item.dieuKienapDung !== 0);
    } else if (this.filterType === 'offline') {
      filtered = filtered.filter(item => item.dieuKienapDung === 0);
    }

    if (this.statusFilter === 'active') {
      filtered = filtered.filter(item => item.trangThai === 1);
    } else if (this.statusFilter === 'inactive') {
      filtered = filtered.filter(item => item.trangThai === 0);
    }

    this.filteredPhieuGiamGias = this.sortData(filtered);
    console.log('📌 Dữ liệu sau khi lọc:', this.filteredPhieuGiamGias);
    this.cdr.detectChanges();
  }

  sortBy(field: string, direction: string): void {
    this.sortField = field;
    this.sortDirection = direction;
    this.applyFilter();
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
      if (Object.values(this.searchParams).some(value => value)) {
        this.onSearchInput();
      } else {
        this.loadAllPhieuGiamGia();
      }
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      if (Object.values(this.searchParams).some(value => value)) {
        this.onSearchInput();
      } else {
        this.loadAllPhieuGiamGia();
      }
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      if (Object.values(this.searchParams).some(value => value)) {
        this.onSearchInput();
      } else {
        this.loadAllPhieuGiamGia();
      }
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
      this.phieuGiamGias.push(newVoucher);
      this.applyFilter();
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
          this.applyFilter();
        }
        this.cdr.detectChanges();
      }
    });
  }

  toggleStatus(voucher: any): void {
    console.log('📌 Thay đổi trạng thái voucher:', voucher.id, 'trangThai hiện tại:', voucher.trangThai);
    const newStatus = voucher.trangThai === 1 ? 0 : 1;

    this.phieuGiamGiaService.updateStatus(voucher.id, newStatus).subscribe({
      next: (response) => {
        console.log('✅ Cập nhật trạng thái thành công:', response);
        if (response.status === 'success') {
          voucher.trangThai = newStatus;
          this.applyFilter();
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: `Voucher "${voucher.maGiamGia}" đã được ${newStatus === 1 ? 'kích hoạt' : 'dừng hoạt động'} thành công!`,
            confirmButtonText: 'OK'
          });
        } else {
          console.error('❌ Phản hồi không thành công:', response.message);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi!',
            text: response.message,
            confirmButtonText: 'Đóng'
          });
        }
      },
      error: (error) => {
        console.error('❌ Lỗi khi cập nhật trạng thái:', error);
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
      console.log('📌 Ngày hết hạn không tồn tại hoặc rỗng:', expiryDate);
      return false;
    }
    const expiry = new Date(expiryDate).getTime();
    if (isNaN(expiry)) {
      console.log('📌 Định dạng ngày hết hạn không hợp lệ:', expiryDate);
      return false;
    }
    const now = new Date().getTime();
    console.log('📌 So sánh ngày hết hạn:', expiryDate, '=>', expiry, 'với hiện tại:', now, 'chưa hết hạn:', expiry > now);
    return expiry > now;
  }

  shouldShowToggleButton(item: any): boolean {
    const show = item.trangThai === 1 && this.isNotExpired(item.ngayHetHan);
    return show;
  }

  shouldShowActivateButton(item: any): boolean {
    const show = item.trangThai === 0 && this.isNotExpired(item.ngayHetHan);
    return show;
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredPhieuGiamGias.map(item => ({
      ID: item.id,
      [this.filterType === 'offline' ? 'Phiếu giảm giá' : 'Mã giảm giá']: item.maGiamGia,
      'Giá trị': item.giaTriGiam,
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
      { wch: 5 },  // ID
      { wch: 15 }, // Mã giảm giá / Phiếu giảm giá
      { wch: 10 }, // Giá trị
      { wch: 15 }, // Ngày bắt đầu
      { wch: 15 }, // Giờ bắt đầu
      { wch: 15 }, // Ngày hết hạn
      { wch: 15 }, // Giờ hết hạn
      { wch: 10 }, // Số lượng
      { wch: 10 }, // Luồng
      { wch: 15 }, // Giá trị tối đa
      { wch: 15 }  // Trạng thái
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
}