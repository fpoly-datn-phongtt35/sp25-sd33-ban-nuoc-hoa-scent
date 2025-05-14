import { Component, OnInit } from '@angular/core';
import { BannerService, Banner } from '../service/BannerService';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-banner',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.scss']
})
export class BannerComponent implements OnInit {
  banners: Banner[] = [];
  selectedBanner: Banner | null = null;
  isEditing: boolean = false;
  formData: Partial<Banner> = {
    title: '',
    linkUrl: '',
    position: '',
    isActive: 1
  };
  selectedFile: File | null = null;
  private baseUrl: string = 'http://localhost:8080'; // Thêm baseUrl

  constructor(private bannerService: BannerService) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.bannerService.getAllBanners().subscribe({
      next: (banners) => {
        this.banners = banners.map(banner => ({
          ...banner,
          imageUrl: banner.imageUrl.startsWith('http') ? banner.imageUrl : `${this.baseUrl}${banner.imageUrl}`
        }));
      },
      error: (error) => {
        console.error('Error loading banners:', error);
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể tải danh sách banner.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  startEditing(banner: Banner): void {
    this.selectedBanner = { ...banner };
    this.formData = { ...banner };
    this.isEditing = true;
  }

  setStatus(status: number): void {
    this.formData.isActive = status;
  }

  createBanner(): void {
    if (!this.formData.title || !this.selectedFile) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng nhập tiêu đề và chọn hình ảnh!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', this.formData.title);
    formDataToSend.append('file', this.selectedFile);
    if (this.formData.linkUrl) formDataToSend.append('linkUrl', this.formData.linkUrl);
    if (this.formData.position) formDataToSend.append('position', this.formData.position);
    formDataToSend.append('isActive', String(this.formData.isActive));

    this.bannerService.createBanner(formDataToSend).subscribe({
      next: (banner) => {
        this.banners.push({
          ...banner,
          imageUrl: banner.imageUrl.startsWith('http') ? banner.imageUrl : `${this.baseUrl}${banner.imageUrl}`
        });
        this.resetForm();
        Swal.fire({
          title: 'Thành công!',
          text: 'Banner đã được thêm.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Error creating banner:', error);
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể thêm banner.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  updateBanner(): void {
    if (!this.selectedBanner || !this.formData.title) {
      Swal.fire({
        title: 'Lỗi',
        text: 'Vui lòng nhập tiêu đề!',
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('title', this.formData.title);
    if (this.selectedFile) {
      formDataToSend.append('file', this.selectedFile);
    }
    if (this.formData.linkUrl) formDataToSend.append('linkUrl', this.formData.linkUrl);
    if (this.formData.position) formDataToSend.append('position', this.formData.position);
    formDataToSend.append('isActive', String(this.formData.isActive));

    console.log('Dữ liệu gửi đi:', [...formDataToSend.entries()]);

    this.bannerService.updateBanner(this.selectedBanner.id, formDataToSend).subscribe({
      next: (updatedBanner) => {
        this.loadBanners();
        this.resetForm();
        this.isEditing = false;
        Swal.fire({
          title: 'Thành công!',
          text: 'Banner đã được cập nhật.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Error updating banner:', error);
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể cập nhật banner.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  toggleStatus(id: number): void {
    this.bannerService.toggleBannerStatus(id).subscribe({
      next: (updatedBanner) => {
        this.loadBanners();
        Swal.fire({
          title: 'Thành công!',
          text: `Banner đã được ${updatedBanner.isActive === 1 ? 'bật' : 'tắt'} trạng thái.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
      },
      error: (error) => {
        console.error('Error toggling status:', error);
        Swal.fire({
          title: 'Lỗi',
          text: 'Không thể thay đổi trạng thái banner.',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    });
  }

  deleteBanner(id: number): void {
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa banner này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        this.bannerService.deleteBanner(id).subscribe({
          next: () => {
            this.banners = this.banners.filter(b => b.id !== id);
            Swal.fire({
              title: 'Thành công!',
              text: 'Banner đã được xóa.',
              icon: 'success',
              timer: 1500,
              showConfirmButton: false
            });
          },
          error: (error) => {
            console.error('Error deleting banner:', error);
            Swal.fire({
              title: 'Lỗi',
              text: 'Không thể xóa banner.',
              icon: 'error',
              confirmButtonText: 'OK'
            });
          }
        });
      }
    });
  }

  resetForm(): void {
    this.formData = {
      title: '',
      linkUrl: '',
      position: '',
      isActive: 1
    };
    this.selectedFile = null;
    this.selectedBanner = null;
    this.isEditing = false;
  }
}