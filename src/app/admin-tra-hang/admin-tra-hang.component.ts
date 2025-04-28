import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { TraHangService } from '../service/TraHangService';
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
  yeuCauList: YeuCauTraHang[] = [];
  tinhTrangHangFilter: string = '';
  errorMessage: string | null = null;
  idTaiKhoan: number;
  showRejectModal: boolean = false;
  lyDoTuChoi: string = '';
  selectedYeuCauId: number | null = null;
  isLoading: boolean = false;
  selectedImageUrl: string | null = null;
  selectedVideoUrl: string | null = null;

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
    }
  }

  loadYeuCauTraHang(): void {
    this.isLoading = true;
    this.cdr.detectChanges();

    if (this.tinhTrangHangFilter) {
      this.traHangService.getYeuCauByTinhTrangHang(this.tinhTrangHangFilter).subscribe({
        next: (data) => {
          this.yeuCauList = data;
          this.errorMessage = null;
          this.isLoading = false;
          this.cdr.detectChanges();
          console.log('Dữ liệu yêu cầu:', this.yeuCauList);
        },
        error: (error) => {
          this.errorMessage = 'Không thể tải danh sách yêu cầu: ' + (error.message || 'Lỗi không xác định');
          this.yeuCauList = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.traHangService.getYeuCauByTinhTrangHang('NguyenVen').subscribe({
        next: (nguyenVenData) => {
          this.traHangService.getYeuCauByTinhTrangHang('HuHong').subscribe({
            next: (huHongData) => {
              this.yeuCauList = [...nguyenVenData, ...huHongData];
              this.errorMessage = null;
              this.isLoading = false;
              this.cdr.detectChanges();
              console.log('Dữ liệu yêu cầu:', this.yeuCauList);
            },
            error: (error) => {
              this.errorMessage = 'Không thể tải danh sách yêu cầu: ' + (error.message || 'Lỗi không xác định');
              this.yeuCauList = [];
              this.isLoading = false;
              this.cdr.detectChanges();
            }
          });
        },
        error: (error) => {
          this.errorMessage = 'Không thể tải danh sách yêu cầu: ' + (error.message || 'Lỗi không xác định');
          this.yeuCauList = [];
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
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
  }

  closeImageModal(): void {
    this.selectedImageUrl = null;
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
    console.error('Lỗi tải hình ảnh:', event);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Không thể tải hình ảnh.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    });
  }

  onVideoError(event: Event): void {
    console.error('Lỗi tải video:', event);
    Swal.fire({
      icon: 'error',
      title: 'Lỗi!',
      text: 'Không thể tải video.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#ef4444'
    });
  }
}