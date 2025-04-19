import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddBrandComponent } from '../add-brand/add-brand.component';
import { UpdateBrandComponent } from '../update-brand/update-brand.component';
import { ThuongHieuService } from '../../../service/thuonghieu.service';

export interface ThuongHieu {
  id?: number; // Optional for creating new brands
  tenThuongHieu: string;
  quocGia: string;
  moTa: string;
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
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;

  constructor(private thuongHieuService: ThuongHieuService) {}

  ngOnInit(): void {
    this.loadThuongHieus();
  }

  loadThuongHieus(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.thuongHieuService.getThuongHieu1(this.currentPage, this.pageSize).subscribe({
      next: (res) => {
        this.thuongHieus = res.content;
        this.totalPages = res.totalPages;
        this.totalElements = res.totalElements;
        this.isLoading = false;
        console.log('list',this.thuongHieus)
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
    this.loadThuongHieus();
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

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadThuongHieus();
    }
  }

  prevPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadThuongHieus();
    }
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadThuongHieus();
    }
  }

  getPaginationRange(): number[] {
    const delta = 2; // Số trang hiển thị trước và sau trang hiện tại
    const range: number[] = [];
    const start = Math.max(0, this.currentPage - delta);
    const end = Math.min(this.totalPages - 1, this.currentPage + delta);

    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    return range;
  }
}