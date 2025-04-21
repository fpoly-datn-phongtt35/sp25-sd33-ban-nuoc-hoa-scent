import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhongCachService } from '../../../service/PhongCach.service';
import { AddPhongCachComponent } from '../add-phong-cach/add-phong-cach.component';
import { UpdatePhongCachComponent } from '../update-phong-cach/update-phong-cach.component';

export interface PhongCach {
  id?: number;
  tenPhongCach: string;
  moTa: string;
  hasProduct?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-phong-cach',
  standalone: true,
  imports: [CommonModule, FormsModule, AddPhongCachComponent, UpdatePhongCachComponent],
  templateUrl: './phong-cach.component.html',
  styleUrls: ['./phong-cach.component.scss']
})
export class PhongCachComponent implements OnInit {
  phongCachs: PhongCach[] = [];
  isLoading = false;
  errorMessage = '';
  showAddModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  selectedPhongCach: PhongCach | null = null;
  phongCachToDelete: number | null = null;

  page: number = 0;
  size: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(private phongCachService: PhongCachService) {}

  ngOnInit(): void {
    this.loadPhongCachs();
  }

  loadPhongCachs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.phongCachService.getPagedPhongCach(this.page, this.size).subscribe({
      next: (res) => {
        this.phongCachs = res.content.map((phongCach: PhongCach) => ({
          ...phongCach,
          isNew: false
        }));
        this.totalPages = res.page?.totalPages || 1;
        this.totalElements = res.totalElements || 0;
        this.isLoading = false;
        console.log('phong cach:', this.phongCachs);
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

  handlePhongCachAdded(newPhongCach: PhongCach): void {
    newPhongCach.isNew = true;
    this.phongCachs.unshift(newPhongCach);
    this.closeAddModal();
    this.loadPhongCachs();
  }

  undoAddPhongCach(phongCach: PhongCach): void {
    if (phongCach.id !== undefined) {
      this.phongCachService.deletePhongCach(phongCach.id).subscribe({
        next: () => {
          phongCach.isNew = false;
          this.loadPhongCachs();
          console.log(`Undid adding PhongCach with ID: ${phongCach.id}`);
        },
        error: (err) => {
          console.error('Error undoing PhongCach addition:', err);
          this.errorMessage = 'Không thể hoàn tác thêm phong cách.';
        }
      });
    }
  }

  openUpdateModal(phongCach: PhongCach): void {
    this.selectedPhongCach = { ...phongCach };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedPhongCach = null;
    this.loadPhongCachs();
  }

  openDeleteModal(id: number): void {
    this.phongCachToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.phongCachToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (this.phongCachToDelete !== null) {
      this.phongCachService.deletePhongCach(this.phongCachToDelete).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadPhongCachs();
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
      this.loadPhongCachs();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadPhongCachs();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadPhongCachs();
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
