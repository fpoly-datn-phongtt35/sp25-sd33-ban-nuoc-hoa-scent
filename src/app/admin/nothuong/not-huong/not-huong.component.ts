import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddNotHuongComponent } from '../add-not-huong/add-not-huong.component';
import { UpdateNotHuongComponent } from '../update-not-huong/update-not-huong.component';
import { NotHuongService } from '../../../service/nothuong.service';
import { ToastrService } from 'ngx-toastr';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

// Định nghĩa interface cho NotHuong
export interface NotHuong {
  id?: number;
  tenNotHuong: string;
  moTa: string;
  muiHuongId?: number;
  muiHuong?: MuiHuong;
  hasProduct?: boolean;
  isNew?: boolean;
}

// Định nghĩa interface cho MuiHuong
export interface MuiHuong {
  id: number;
  tenMuiHuong: string;
  moTa: string;
}

@Component({
  selector: 'app-not-huong',
  standalone: true,
  imports: [CommonModule, FormsModule, AddNotHuongComponent, UpdateNotHuongComponent],
  templateUrl: './not-huong.component.html',
  styleUrls: ['./not-huong.component.scss']
})
export class NotHuongComponent implements OnInit, OnDestroy {
  notHuongs: NotHuong[] = [];
  filteredNotHuongs: NotHuong[] = [];
  displayedNotHuongs: NotHuong[] = [];
  muiHuongs: MuiHuong[] = [];
  isLoading = false;
  errorMessage = '';
  showAddModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  selectedNotHuong: NotHuong | null = null;
  notHuongToDelete: number | null = null;

  page: number = 0;
  size: number = 10000;
  pageSize: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;
  searchTerm: string = '';
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;
  private muiHuongSubscription: Subscription;

  constructor(
    private notHuongService: NotHuongService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    // Đăng ký lắng nghe danh sách mùi hương
    this.muiHuongSubscription = this.notHuongService.muiHuongs$.subscribe({
      next: (muiHuongs) => {
        this.muiHuongs = muiHuongs;
        this.loadNotHuongs(); // Cập nhật lại danh sách nốt hương khi mùi hương thay đổi
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách mùi hương:', err);
        this.muiHuongs = [];
      }
    });

    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.searchTerm = term;
        this.page = 0;
        this.filterNotHuongs();
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.muiHuongSubscription) {
      this.muiHuongSubscription.unsubscribe();
    }
  }

  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  filterNotHuongs(): void {
    if (!this.searchTerm) {
      this.filteredNotHuongs = [...this.notHuongs];
    } else {
      const searchTermLower = this.removeVietnameseTones(this.searchTerm.toLowerCase());
      this.filteredNotHuongs = this.notHuongs.filter((notHuong: NotHuong) =>
        this.removeVietnameseTones(notHuong.tenNotHuong.toLowerCase()).includes(searchTermLower) ||
        this.removeVietnameseTones((notHuong.moTa || '').toLowerCase()).includes(searchTermLower) ||
        String(notHuong.id).includes(searchTermLower)
      );
    }
    this.totalElements = this.filteredNotHuongs.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize) || 1;
    if (this.page >= this.totalPages) {
      this.page = Math.max(0, this.totalPages - 1);
    }
    this.updateDisplayedNotHuongs();
  }

  updateDisplayedNotHuongs(): void {
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    this.displayedNotHuongs = this.filteredNotHuongs.slice(start, end);
  }

  loadNotHuongs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.notHuongService.getPagedNotHuong(this.page, this.size).subscribe({
      next: (res) => {
        if (res && res.content) {
          this.notHuongs = res.content.map((notHuong: NotHuong) => ({
            ...notHuong,
            muiHuong: this.muiHuongs.find(mh => mh.id === notHuong.muiHuongId),
            isNew: false
          }));
          this.filterNotHuongs();
        } else {
          this.errorMessage = 'Không tìm thấy dữ liệu nốt hương.';
          this.notHuongs = [];
          this.filterNotHuongs();
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải danh sách nốt hương: ' + (error.message || 'Lỗi không xác định');
        this.isLoading = false;
        this.filterNotHuongs();
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
    this.filterNotHuongs();
    this.closeAddModal();
    this.toastr.success('Thêm nốt hương thành công!', 'Thành công');
  }

  undoAddNotHuong(notHuong: NotHuong): void {
    if (notHuong.id !== undefined) {
      this.notHuongService.deleteNotHuong(notHuong.id).subscribe({
        next: () => {
          this.notHuongs = this.notHuongs.filter(nh => nh.id !== notHuong.id);
          this.filterNotHuongs();
          this.toastr.success('Hoàn tác thêm nốt hương thành công!', 'Thành công');
        },
        error: (err) => {
          this.errorMessage = 'Không thể hoàn tác thêm nốt hương: ' + (err.message || 'Lỗi không xác định');
          this.toastr.error(this.errorMessage, 'Lỗi');
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
  }

  handleNotHuongUpdated(updatedNotHuong: NotHuong): void {
    if (updatedNotHuong.id !== undefined) {
      const index = this.notHuongs.findIndex(nh => nh.id === updatedNotHuong.id);
      if (index !== -1) {
        this.notHuongs[index] = { ...updatedNotHuong, hasProduct: this.notHuongs[index].hasProduct, isNew: false };
        this.filterNotHuongs();
        this.toastr.success('Cập nhật nốt hương thành công!', 'Thành công');
      } else {
        this.toastr.error('Không tìm thấy nốt hương để cập nhật.', 'Lỗi');
      }
    }
    this.closeUpdateModal();
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
          this.notHuongs = this.notHuongs.filter(nh => nh.id !== this.notHuongToDelete);
          this.filterNotHuongs();
          this.closeDeleteModal();
          this.toastr.success('Xóa nốt hương thành công!', 'Thành công');
        },
        error: (error) => {
          this.errorMessage = 'Không thể xóa nốt hương: ' + (error.message || 'Lỗi không xác định');
          this.toastr.error(this.errorMessage, 'Lỗi');
          this.closeDeleteModal();
        }
      });
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      this.page = p;
      this.updateDisplayedNotHuongs();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.updateDisplayedNotHuongs();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.updateDisplayedNotHuongs();
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

    return range;
  }
}