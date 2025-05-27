import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { TraHangService, Page } from '../service/TraHangService';
import { TokenService } from '../service/token.service';
import { YeuCauTraHang } from '../service/response/YeuCauTraHang';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-admin-tra-hang',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule],
  templateUrl: './admin-tra-hang.component.html',
  styleUrls: ['./admin-tra-hang.component.scss']
})
export class AdminTraHangComponent implements OnInit {
  yeuCauPage: Page<YeuCauTraHang> | null = null;
  tinhTrangHangFilter: string = '';
  errorMessage: string | null = null;
  idTaiKhoan: number;
  showRejectModal: boolean = false;
  lyDoTuChoi: string = '';
  selectedYeuCauId: number | null = null;
  isLoading: boolean = false;
  selectedImageUrl: string | null = null;
  selectedVideoUrl: string | null = null;
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;

  constructor(
    private traHangService: TraHangService,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef
  ) {
    this.idTaiKhoan = this.tokenService.getUserId();
    if (!this.idTaiKhoan) {
      this.errorMessage = 'Vui lòng đăng nhập với tài khoản admin để quản lý yêu cầu trả hàng.';
    }
  }

  ngOnInit(): void {
    if (this.idTaiKhoan) {
      this.loadYeuCauTraHang();
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: this.errorMessage || 'Vui lòng đăng nhập.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
    }
  }

  loadYeuCauTraHang(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    if (this.tinhTrangHangFilter) {
      this.traHangService.getYeuCauByTinhTrangHang(this.tinhTrangHangFilter, this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.yeuCauPage = response;
          this.totalPages = response.page.totalPages || 0;
          this.errorMessage = null;
          this.isLoading = false;
         
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Không thể tải danh sách yêu cầu: ' + (error.message || 'Lỗi không xác định');
          this.yeuCauPage = null;
          this.totalPages = 0;
          this.isLoading = false;
         
          this.cdr.detectChanges();
        }
      });
    } else {
      this.traHangService.getAllYeuCauTraHang(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.yeuCauPage = response;
          this.totalPages = response.page.totalPages || 0;
          this.errorMessage = null;
          this.isLoading = false;
          
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.errorMessage = 'Không thể tải danh sách yêu cầu: ' + (error.message || 'Lỗi không xác định');
          this.yeuCauPage = null;
          this.totalPages = 0;
          this.isLoading = false;
         
          this.cdr.detectChanges();
        }
      });
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.currentPage) {
    
      this.currentPage = p;
      this.loadYeuCauTraHang();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadYeuCauTraHang();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadYeuCauTraHang();
    }
  }

  getPaginationRange(): { page: number, isEllipsis: boolean }[] {
    const range: { page: number, isEllipsis: boolean }[] = [];
    const maxVisiblePages = 3;

    if (this.totalPages <= 0) return range;

    if (this.totalPages <= 5) {
      for (let i = 0; i < this.totalPages; i++) {
        range.push({ page: i, isEllipsis: false });
      }
    } else {
      range.push({ page: 0, isEllipsis: false });

      let start = Math.max(1, this.currentPage - 1);
      let end = Math.min(this.totalPages - 2, this.currentPage + 1);

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

  getTrangThaiText(trangThai: number): string {
    switch (trangThai) {
      case 0: return 'Chờ duyệt';
      case 1: return 'Đã duyệt';
      case 2: return 'Đã từ chối';
      case 3: return 'Hoàn thành';
      default: return 'Không xác định';
    }
  }

  approveYeuCau(id: number): void {
    this.traHangService.approveYeuCauTraHang(id, this.idTaiKhoan).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Yêu cầu trả hàng đã được duyệt!',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6'
        });
        this.loadYeuCauTraHang();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể duyệt yêu cầu: ' + (error.error?.message || error.message),
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  openRejectModal(id: number): void {
    this.selectedYeuCauId = id;
    this.lyDoTuChoi = '';
    this.showRejectModal = true;
    this.cdr.detectChanges();
  }

  closeRejectModal(): void {
    this.showRejectModal = false;
    this.selectedYeuCauId = null;
    this.lyDoTuChoi = '';
    this.cdr.detectChanges();
  }

  rejectYeuCau(): void {
    if (!this.selectedYeuCauId) return;
    if (!this.lyDoTuChoi.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi!',
        text: 'Vui lòng nhập lý do từ chối.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    this.traHangService.rejectYeuCauTraHang(this.selectedYeuCauId, this.idTaiKhoan, this.lyDoTuChoi).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Yêu cầu trả hàng đã được từ chối!',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6'
        });
        this.closeRejectModal();
        this.loadYeuCauTraHang();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể từ chối yêu cầu: ' + (error.error?.message || error.message),
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  completeYeuCau(id: number): void {
    this.traHangService.completeYeuCauTraHang(id, this.idTaiKhoan).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Thành công!',
          text: 'Yêu cầu trả hàng đã được hoàn thành!',
          confirmButtonText: 'OK',
          confirmButtonColor: '#3b82f6'
        });
        this.loadYeuCauTraHang();
      },
      error: (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Lỗi!',
          text: 'Không thể hoàn thành yêu cầu: ' + (error.error?.message || error.message),
          confirmButtonText: 'OK',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  openImageModal(url: string): void {
    this.selectedImageUrl = url;
    this.cdr.detectChanges();
  }

  closeImageModal(): void {
    this.selectedImageUrl = null;
    this.cdr.detectChanges();
  }

  openVideoModal(url: string): void {
    this.selectedVideoUrl = url;
    this.cdr.detectChanges();
  }

  closeVideoModal(): void {
    this.selectedVideoUrl = null;
    this.cdr.detectChanges();
  }

  onImageError(event: Event): void {
   
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Không thể tải hình ảnh.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    });
  }

  onVideoError(event: Event): void {
    
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Không thể tải video.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    });
  }
}