import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddNotHuongComponent } from '../add-not-huong/add-not-huong.component';
import { UpdateNotHuongComponent } from '../update-not-huong/update-not-huong.component';
import { NotHuongService } from '../../../service/nothuong.service';
import { MuiHuongService } from '../../../service/muihuong.service';

export interface NotHuong {
  id?: number;
  tenNotHuong: string;
  moTa: string;
  muiHuongId?: number;
  tenMuiHuong?: string;
  hasProduct?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-not-huong',
  standalone: true,
  imports: [CommonModule, FormsModule, AddNotHuongComponent, UpdateNotHuongComponent],
  templateUrl: './not-huong.component.html',
  styleUrls: ['./not-huong.component.scss']
})
export class NotHuongComponent implements OnInit {
  notHuongs: NotHuong[] = [];
  isLoading = false;
  errorMessage = '';
  showAddModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  selectedNotHuong: NotHuong | null = null;
  notHuongToDelete: number | null = null;

  page: number = 0;
  size: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(
    private notHuongService: NotHuongService,
    private muiHuongService: MuiHuongService
  ) {}

  ngOnInit(): void {
    this.loadNotHuongs();
  }

  loadNotHuongs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.notHuongService.getPagedNotHuong(this.page, this.size).subscribe({
      next: (res) => {
        this.notHuongs = res.content.map((notHuong: NotHuong) => ({
          ...notHuong,
          isNew: false
        }));
        this.totalPages = res.page?.totalPages || 1;
        this.totalElements = res.totalElements || 0;
        this.isLoading = false;
        console.log('not huong:', this.notHuongs);
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

  handleNotHuongAdded(newNotHuong: NotHuong): void {
    newNotHuong.isNew = true;
    this.notHuongs.unshift(newNotHuong);
    this.closeAddModal();
    this.loadNotHuongs();
  }

  undoAddNotHuong(notHuong: NotHuong): void {
    if (notHuong.id !== undefined) {
      this.notHuongService.deleteNotHuong(notHuong.id).subscribe({
        next: () => {
          notHuong.isNew = false;
          this.loadNotHuongs();
          console.log(`Undid adding NotHuong with ID: ${notHuong.id}`);
        },
        error: (err) => {
          console.error('Error undoing NotHuong addition:', err);
          this.errorMessage = 'Không thể hoàn tác thêm nốt hương.';
        }
      });
    }
  }

  openUpdateModal(notHuong: NotHuong): void {
    this.selectedNotHuong = { ...notHuong };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedNotHuong = null;
    this.loadNotHuongs();
  }

  openDeleteModal(id: number): void {
    this.notHuongToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.notHuongToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (this.notHuongToDelete !== null) {
      this.notHuongService.deleteNotHuong(this.notHuongToDelete).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadNotHuongs();
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
      this.loadNotHuongs();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadNotHuongs();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadNotHuongs();
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
