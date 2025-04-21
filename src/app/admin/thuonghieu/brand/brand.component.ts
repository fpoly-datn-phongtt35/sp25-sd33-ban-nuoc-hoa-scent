import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddBrandComponent } from '../add-brand/add-brand.component';
import { UpdateBrandComponent } from '../update-brand/update-brand.component';
import { ThuongHieuService } from '../../../service/thuonghieu.service';

export interface ThuongHieu {
  id?: number;
  tenThuongHieu: string;
  quocGia: string;
  moTa: string;
  hasProduct?: boolean;
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
  selectedThuongHieu: ThuongHieu | null = null;
  brandToDelete: number | null = null;

  page: number = 0;
  size: number = 5;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(private thuongHieuService: ThuongHieuService) {}

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
    newThuongHieu.isNew = true;
    this.thuongHieus.unshift(newThuongHieu);
    this.closeAddModal();
    this.loadThuongHieus();
  }

  undoAddThuongHieu(thuongHieu: ThuongHieu): void {
    if (thuongHieu.id !== undefined) {
      this.thuongHieuService.deleteThuongHieu(thuongHieu.id).subscribe({
        next: () => {
          thuongHieu.isNew = false;
          this.loadThuongHieus();
          console.log(`Undid adding ThuongHieu with ID: ${thuongHieu.id}`);
        },
        error: (err) => {
          console.error('Error undoing ThuongHieu addition:', err);
          this.errorMessage = 'Không thể hoàn tác thêm thương hiệu.';
        }
      });
    }
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
        },
        error: (error) => {
          this.errorMessage = error.message;
          this.closeDeleteModal();
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
