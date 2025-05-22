import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal, NgbModalModule, NgbPaginationModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { NhomHuongService } from '../../../service/nhomhuong.service';
import { AddNhomhuongComponent } from '../add-nhomhuong/add-nhomhuong.component';
import { UpdateNhomhuongComponent } from '../update-nhomhuong/update-nhomhuong.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

export interface NhomHuong {
  id?: number;
  tenNhomHuong: string;
  mota: string;
  hasProduct?: boolean;
  isNew?: boolean;
}

@Component({
  selector: 'app-fragrance-list',
  standalone: true,
  imports: [CommonModule, NgbModalModule, NgbPaginationModule, FormsModule],
  templateUrl: './fragrance-list.component.html',
  styleUrls: ['./fragrance-list.component.scss']
})
export class FragranceListComponent implements OnInit, OnDestroy {
  nhomHuongs: NhomHuong[] = [];
  filteredNhomHuongs: NhomHuong[] = []; // Filtered list for search
  displayedNhomHuongs: NhomHuong[] = []; // List displayed on current page
  isLoading = false;
  errorMessage = '';
  page: number = 0;
  size: number = 10000; // Fetch all data from backend
  pageSize: number = 10; // Items per page on frontend
  totalPages: number = 1;
  totalElements: number = 0;
  searchTerm: string = ''; // Search keyword
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  constructor(
    private nhomHuongService: NhomHuongService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadNhomHuongs();
    // Setup debounce for search
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.searchTerm = term;
        this.page = 0; // Reset page on search
        this.filterNhomHuongs();
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // Handle search term change
  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  // Remove Vietnamese tones for search
  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  // Filter NhomHuong based on search term
  filterNhomHuongs(): void {
    if (!this.searchTerm) {
      this.filteredNhomHuongs = [...this.nhomHuongs];
    } else {
      const searchTermLower = this.removeVietnameseTones(this.searchTerm.toLowerCase());
      this.filteredNhomHuongs = this.nhomHuongs.filter((nhomHuong: NhomHuong) =>
        this.removeVietnameseTones(nhomHuong.tenNhomHuong.toLowerCase()).includes(searchTermLower) ||
        this.removeVietnameseTones((nhomHuong.mota || '').toLowerCase()).includes(searchTermLower) ||
        String(nhomHuong.id).includes(searchTermLower)
      );
    }
    this.totalElements = this.filteredNhomHuongs.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize); // Calculate pages
    this.updateDisplayedNhomHuongs();
  }

  // Update displayed list based on current page
  updateDisplayedNhomHuongs(): void {
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    this.displayedNhomHuongs = this.filteredNhomHuongs.slice(start, end);
  }

  loadNhomHuongs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.nhomHuongService.getPagedNhomHuong(this.page, this.size).subscribe({
      next: (res) => {
        this.nhomHuongs = res.content.map((nhomHuong: NhomHuong) => ({
          ...nhomHuong,
          isNew: false
        }));
        this.filteredNhomHuongs = [...this.nhomHuongs]; // Initialize filtered list
        this.totalElements = this.filteredNhomHuongs.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.isLoading = false;
        this.filterNhomHuongs(); // Apply filter if search term exists
        console.log('Danh sách nhóm hương:', this.nhomHuongs);
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải danh sách nhóm hương: ' + error.message;
        this.isLoading = false;
      }
    });
  }

  deleteNhomHuong(id: number): void {
    const modalRef = this.modalService.open(NgbModal, {
      backdrop: 'static',
      keyboard: false
    });
    modalRef.componentInstance.title = 'Xác Nhận Xóa';
    modalRef.componentInstance.message = 'Bạn có chắc muốn xóa nhóm hương này?';
    modalRef.componentInstance.confirm.subscribe(() => {
      this.nhomHuongService.deleteNhomHuong(id).subscribe({
        next: () => {
          this.loadNhomHuongs();
          modalRef.close();
        },
        error: (err) => {
          this.errorMessage = 'Không thể xóa nhóm hương: ' + err.message;
          modalRef.close();
        }
      });
    });
  }

  undoAddNhomHuong(nhomHuong: NhomHuong): void {
    if (nhomHuong.id !== undefined) {
      this.nhomHuongService.deleteNhomHuong(nhomHuong.id).subscribe({
        next: () => {
          this.loadNhomHuongs();
          console.log(`Undid adding NhomHuong with ID: ${nhomHuong.id}`);
        },
        error: (err) => {
          this.errorMessage = 'Không thể hoàn tác thêm nhóm hương: ' + err.message;
          console.error('Error undoing NhomHuong addition:', err);
        }
      });
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.updateDisplayedNhomHuongs();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.updateDisplayedNhomHuongs();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.updateDisplayedNhomHuongs();
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

    modalRef.componentInstance.nhomHuongAdded.subscribe((newNhomHuong: NhomHuong) => {
      newNhomHuong.isNew = true;
      this.nhomHuongs.unshift(newNhomHuong);
      this.filterNhomHuongs(); // Update filtered list and pagination
      console.log('🎉 New NhomHuong added:', newNhomHuong);
    });
  }

  openEditNhomHuongModal(nhomHuong: NhomHuong): void {
    const modalRef = this.modalService.open(UpdateNhomhuongComponent, {
      backdrop: 'static',
      keyboard: false
    });

    modalRef.componentInstance.nhomHuong = { ...nhomHuong };

    modalRef.componentInstance.nhomHuongUpdated.subscribe((updatedNhomHuong: NhomHuong) => {
      console.log('🔄 Updated NhomHuong:', updatedNhomHuong);
      this.loadNhomHuongs();
    });
  }
}