import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddMuiHuongComponent } from '../add-mui-huong/add-mui-huong.component';
import { UpdateMuiHuongComponent } from '../update-mui-huong/update-mui-huong.component';
import { MuiHuongService } from '../../../service/muihuong.service';

export interface MuiHuong {
  id?: number;
  tenMuiHuong: string;
  moTa: string;
  hasProduct?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-mui-huong',
  standalone: true,
  imports: [CommonModule, FormsModule, AddMuiHuongComponent, UpdateMuiHuongComponent],
  templateUrl: './mui-huong.component.html',
  styleUrls: ['./mui-huong.component.scss']
})
export class MuiHuongComponent implements OnInit {
  muiHuongs: MuiHuong[] = [];
  isLoading = false;
  errorMessage = '';
  showAddModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  selectedMuiHuong: MuiHuong | null = null;
  muiHuongToDelete: number | null = null;

  page: number = 0;
  size: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(private muiHuongService: MuiHuongService) {}

  ngOnInit(): void {
    this.loadMuiHuongs();
  }

  loadMuiHuongs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.muiHuongService.getPagedMuiHuong(this.page, this.size).subscribe({
      next: (res) => {
        this.muiHuongs = res.content.map((muiHuong: MuiHuong) => ({
          ...muiHuong,
          isNew: false
        }));
        this.totalPages = res.page?.totalPages || 1;
        this.totalElements = res.totalElements || 0;
        this.isLoading = false;
        console.log('mui huong:', this.muiHuongs);
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

  handleMuiHuongAdded(newMuiHuong: MuiHuong): void {
    newMuiHuong.isNew = true;
    this.muiHuongs.unshift(newMuiHuong);
    this.closeAddModal();
    this.loadMuiHuongs();
  }

  undoAddMuiHuong(muiHuong: MuiHuong): void {
    if (muiHuong.id !== undefined) {
      this.muiHuongService.deleteMuiHuong(muiHuong.id).subscribe({
        next: () => {
          muiHuong.isNew = false;
          this.loadMuiHuongs();
          console.log(`Undid adding MuiHuong with ID: ${muiHuong.id}`);
        },
        error: (err) => {
          console.error('Error undoing MuiHuong addition:', err);
          this.errorMessage = 'Không thể hoàn tác thêm mùi hương.';
        }
      });
    }
  }

  openUpdateModal(muiHuong: MuiHuong): void {
    this.selectedMuiHuong = { ...muiHuong };
    this.showUpdateModal = true;
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.selectedMuiHuong = null;
    this.loadMuiHuongs();
  }

  openDeleteModal(id: number): void {
    this.muiHuongToDelete = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.muiHuongToDelete = null;
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (this.muiHuongToDelete !== null) {
      this.muiHuongService.deleteMuiHuong(this.muiHuongToDelete).subscribe({
        next: () => {
          this.closeDeleteModal();
          this.loadMuiHuongs();
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
      this.loadMuiHuongs();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadMuiHuongs();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadMuiHuongs();
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
