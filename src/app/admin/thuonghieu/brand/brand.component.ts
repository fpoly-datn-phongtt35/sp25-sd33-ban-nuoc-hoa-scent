import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddBrandComponent } from '../add-brand/add-brand.component';
import { UpdateBrandComponent } from '../update-brand/update-brand.component';
import { ThuongHieuService } from '../../../service/thuonghieu.service';
import { ToastrService } from 'ngx-toastr';

export interface ThuongHieu {
  id?: number;
  tenThuongHieu: string;
  quocGia: string;
  moTa: string;
  hasProduct?: boolean;
  soLuongSanPham?: number;
  canRestore?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-brand',
  standalone: true,
  imports: [CommonModule, AddBrandComponent, UpdateBrandComponent],
  templateUrl: './brand.component.html',
  styleUrls: ['./brand.component.scss']
})
export class BrandComponent implements OnInit {
  thuongHieus: ThuongHieu[] = [];
  isLoading = false;
  errorMessage = '';
  showAddModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  showDeactivateModal = false;
  showRestoreModal = false;
  selectedThuongHieu: ThuongHieu | null = null;
  brandToDelete: number | null = null;
  brandToDeactivate: number | null = null;
  brandToRestore: number | null = null;
  isDeactivating = false;
  isRestoring = false;

  page: number = 0;
  size: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(
    private thuongHieuService: ThuongHieuService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadThuongHieus();
  }

  loadThuongHieus(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.thuongHieuService.getThuongHieu1(this.page, this.size).subscribe({
      next: (res) => {
        this.thuongHieus = res.content.map((thuongHieu: ThuongHieu) => ({
          ...thuongHieu,
          isNew: false
        }));
        this.totalPages = res.page?.totalPages || 1;
        this.totalElements = res.totalElements || 0;
        this.isLoading = false;
        console.log('thương hiệu:', this.thuongHieus);
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
        this.toastr.error(this.errorMessage, 'Lỗi');
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
  }

  handleBrandAdded(newThuongHieu: ThuongHieu): void {
    console.log('Đã thêm thương hiệu:', newThuongHieu); // Debug
    this.page = 0; // Quay về trang đầu để hiển thị thương hiệu mới
    this.closeAddModal();
    this.loadThuongHieus();
    this.toastr.success('Thêm thương hiệu thành công!', 'Thành công');
  }

  openUpdateModal(thuongHieu: ThuongHieu): void {
    this.selectedThuongHieu = { ...thuongHieu };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedThuongHieu = null;
    this.loadThuongHieus();
  }

  openDeleteModal(id: number): void {
    this.brandToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.brandToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (this.brandToDelete !== null) {
      this.thuongHieuService.deleteThuongHieu(this.brandToDelete).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadThuongHieus();
          this.toastr.success('Xóa thương hiệu thành công!', 'Thành công');
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.closeDeleteModal();
          this.toastr.error(this.errorMessage, 'Lỗi');
        }
      });
    }
  }

  deactivateSanPham(thuongHieuId: number): void {
    this.brandToDeactivate = thuongHieuId;
    this.showDeactivateModal = true;
  }

  closeDeactivateModal(): void {
    this.brandToDeactivate = null;
    this.showDeactivateModal = false;
  }

  confirmDeactivate(): void {
    if (this.brandToDeactivate !== null) {
      this.isDeactivating = true;
      this.thuongHieuService.deactivateSanPhamByThuongHieuId(this.brandToDeactivate).subscribe({
        next: (message: string) => {
          this.loadThuongHieus();
          this.closeDeactivateModal();
          this.toastr.success(message, 'Thành công');
          this.isDeactivating = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Lỗi khi ngừng bán sản phẩm.';
          this.closeDeactivateModal();
          this.toastr.error(this.errorMessage, 'Lỗi');
          this.isDeactivating = false;
        }
      });
    }
  }

  restoreSanPham(thuongHieuId: number): void {
    this.brandToRestore = thuongHieuId;
    this.errorMessage = '';
    this.showRestoreModal = true;
  }

  closeRestoreModal(): void {
    this.brandToRestore = null;
    this.showRestoreModal = false;
  }

  confirmRestore(): void {
    if (this.brandToRestore !== null) {
      this.isRestoring = true;
      this.thuongHieuService.restoreSanPhamByThuongHieuId(this.brandToRestore).subscribe({
        next: (message: string) => {
          this.loadThuongHieus();
          this.closeRestoreModal();
          this.toastr.success(message, 'Thành công');
          this.isRestoring = false;
        },
        error: (error) => {
          this.errorMessage = error.message || 'Lỗi khi khôi phục sản phẩm.';
          this.closeRestoreModal();
          this.toastr.error(this.errorMessage, 'Lỗi');
          this.isRestoring = false;
        }
      });
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadThuongHieus();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadThuongHieus();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadThuongHieus();
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

    console.log('📌 Pagination range:', range);
    return range;
  }
}
