import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddNotHuongComponent } from '../add-not-huong/add-not-huong.component';
import { UpdateNotHuongComponent } from '../update-not-huong/update-not-huong.component';
import { NotHuongService } from '../../../service/nothuong.service';
import { MuiHuongService } from '../../../service/muihuong.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
export class NotHuongComponent implements OnInit, OnDestroy {
  notHuongs: NotHuong[] = [];
  filteredNotHuongs: NotHuong[] = []; // Danh sách nốt hương sau khi lọc
  displayedNotHuongs: NotHuong[] = []; // Danh sách hiển thị trên trang hiện tại
  isLoading = false;
  errorMessage = '';
  showAddModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  selectedNotHuong: NotHuong | null = null;
  notHuongToDelete: number | null = null;

  page: number = 0;
  size: number = 10000; // Lấy tất cả từ backend
  pageSize: number = 10; // Số nốt hương mỗi trang ở frontend
  totalPages: number = 1;
  totalElements: number = 0;
  searchTerm: string = ''; // Từ khóa tìm kiếm
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  constructor(
    private notHuongService: NotHuongService,
    private muiHuongService: MuiHuongService
  ) {}

  ngOnInit(): void {
    this.loadNotHuongs();
    // Thiết lập debounce cho tìm kiếm
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.searchTerm = term;
        this.page = 0; // Đặt lại trang khi tìm kiếm
        this.filterNotHuongs();
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  // Hàm xử lý thay đổi từ khóa tìm kiếm
  onSearchChange(term: string): void {
    this.searchSubject.next(term);
  }

  // Hàm loại bỏ dấu tiếng Việt
  removeVietnameseTones(str: string): string {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
  }

  // Hàm lọc nốt hương theo từ khóa
  filterNotHuongs(): void {
    if (!this.searchTerm) {
      this.filteredNotHuongs = [...this.notHuongs];
    } else {
      const searchTermLower = this.removeVietnameseTones(this.searchTerm.toLowerCase());
      this.filteredNotHuongs = this.notHuongs.filter((notHuong: NotHuong) =>
        this.removeVietnameseTones(notHuong.tenNotHuong.toLowerCase()).includes(searchTermLower) ||
        this.removeVietnameseTones((notHuong.moTa || '').toLowerCase()).includes(searchTermLower) ||
        (notHuong.tenMuiHuong ? this.removeVietnameseTones(notHuong.tenMuiHuong.toLowerCase()).includes(searchTermLower) : false) ||
        String(notHuong.id).includes(searchTermLower)
      );
    }
    this.totalElements = this.filteredNotHuongs.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize); // Tính số trang
    this.updateDisplayedNotHuongs();
  }

  // Cập nhật danh sách hiển thị dựa trên trang hiện tại
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
        this.notHuongs = res.content.map((notHuong: NotHuong) => ({
          ...notHuong,
          isNew: false
        }));
        this.filteredNotHuongs = [...this.notHuongs]; // Khởi tạo danh sách lọc
        this.totalElements = this.filteredNotHuongs.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.isLoading = false;
        this.filterNotHuongs(); // Áp dụng lọc nếu có từ khóa
        console.log('Danh sách nốt hương:', this.notHuongs);
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải danh sách nốt hương: ' + error.message;
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
    this.filterNotHuongs(); // Cập nhật danh sách lọc và phân trang
    this.closeAddModal();
  }

  undoAddNotHuong(notHuong: NotHuong): void {
    if (notHuong.id !== undefined) {
      this.notHuongService.deleteNotHuong(notHuong.id).subscribe({
        next: () => {
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
          this.errorMessage = 'Không thể xóa nốt hương: ' + error.message;
          this.closeDeleteModal();
        }
      });
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
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

    console.log('📌 Pagination range:', range);
    return range;
  }
}