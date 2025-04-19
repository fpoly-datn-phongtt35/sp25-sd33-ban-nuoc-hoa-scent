
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { NhomHuongService } from '../../../service/nhomhuong.service';
import { AddNhomhuongComponent } from '../add-nhomhuong/add-nhomhuong.component';
import { UpdateNhomhuongComponent } from '../update-nhomhuong/update-nhomhuong.component';

@Component({
  selector: 'app-fragrance-list',
  standalone: true,
  imports: [CommonModule, NgbModalModule, NgbPaginationModule],
  templateUrl: './fragrance-list.component.html',
  styleUrls: ['./fragrance-list.component.scss']
})
export class FragranceListComponent implements OnInit {
  nhomHuongs: any[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage: number = 0;
  page: number = 0;
  size: number = 10;
  totalPages: number = 20;

  constructor(
    private nhomHuongService: NhomHuongService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadNhomHuongs();
  }

  
  loadNhomHuongs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.nhomHuongService.getPagedNhomHuong(this.page, this.size).subscribe({
      next: (res) => {
        this.nhomHuongs = res.content;
        this.totalPages = res.page?.totalPages || 1;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message;
        this.isLoading = false;
      }
    });
  }
  

  changePage(page: number): void {
    this.currentPage = page;
    this.loadNhomHuongs();
  }

  deleteNhomHuong(id: number): void {
    if (confirm('Are you sure you want to delete this NhomHuong?')) {
      this.nhomHuongService.deleteNhomHuong(id).subscribe({
        next: () => this.loadNhomHuongs(),
        error: (err) => console.error('Error deleting NhomHuong:', err)
      });
    }
  }
  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadNhomHuongs();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadNhomHuongs();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadNhomHuongs();
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
  openAddNhomHuongModal(): void {
    const modalRef = this.modalService.open(AddNhomhuongComponent, {
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.nhomHuongAdded.subscribe((newNhomHuong: any) => {
      console.log('🎉 New NhomHuong added:', newNhomHuong);
      this.loadNhomHuongs(); // Refresh the list
    });
  }

  openEditNhomHuongModal(nhomHuong: any): void {
    const modalRef = this.modalService.open(UpdateNhomhuongComponent, {
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.nhomHuong = { ...nhomHuong };

    modalRef.componentInstance.nhomHuongUpdated.subscribe((updatedNhomHuong: any) => {
      console.log('🔄 Updated NhomHuong:', updatedNhomHuong);
      this.loadNhomHuongs(); // Refresh the list
    });
  }
}
