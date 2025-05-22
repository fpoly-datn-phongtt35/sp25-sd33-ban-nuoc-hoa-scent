import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddMuiHuongComponent } from '../add-mui-huong/add-mui-huong.component';
import { UpdateMuiHuongComponent } from '../update-mui-huong/update-mui-huong.component';
import { MuiHuongService } from '../../../service/muihuong.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
export class MuiHuongComponent implements OnInit, OnDestroy {
  muiHuongs: MuiHuong[] = [];
  filteredMuiHuongs: MuiHuong[] = []; // Danh sách mùi hương sau khi lọc
  displayedMuiHuongs: MuiHuong[] = []; // Danh sách hiển thị trên trang hiện tại
  isLoading = false;
  errorMessage = '';
  showAddModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  selectedMuiHuong: MuiHuong | null = null;
  muiHuongToDelete: number | null = null;

  page: number = 0;
  size: number = 10000; // Lấy tất cả từ backend
  pageSize: number = 10; // Số mùi hương mỗi trang ở frontend
  totalPages: number = 1;
  totalElements: number = 0;
  searchTerm: string = ''; // Từ khóa tìm kiếm
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  constructor(private muiHuongService: MuiHuongService) {}

  ngOnInit(): void {
    this.loadMuiHuongs();
    // Thiết lập debounce cho tìm kiếm
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(300))
      .subscribe((term: string) => {
        this.searchTerm = term;
        this.page = 0; // Đặt lại trang khi tìm kiếm
        this.filterMuiHuongs();
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

  // Hàm lọc mùi hương theo từ khóa
  filterMuiHuongs(): void {
    if (!this.searchTerm) {
      this.filteredMuiHuongs = [...this.muiHuongs];
    } else {
      const searchTermLower = this.removeVietnameseTones(this.searchTerm.toLowerCase());
      this.filteredMuiHuongs = this.muiHuongs.filter((muiHuong: MuiHuong) =>
        this.removeVietnameseTones(muiHuong.tenMuiHuong.toLowerCase()).includes(searchTermLower) ||
        this.removeVietnameseTones((muiHuong.moTa || '').toLowerCase()).includes(searchTermLower) ||
        String(muiHuong.id).includes(searchTermLower)
      );
    }
    this.totalElements = this.filteredMuiHuongs.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize); // Tính số trang
    this.updateDisplayedMuiHuongs();
  }

  // Cập nhật danh sách hiển thị dựa trên trang hiện tại
  updateDisplayedMuiHuongs(): void {
    const start = this.page * this.pageSize;
    const end = start + this.pageSize;
    this.displayedMuiHuongs = this.filteredMuiHuongs.slice(start, end);
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
        this.filteredMuiHuongs = [...this.muiHuongs]; // Khởi tạo danh sách lọc
        this.totalElements = this.filteredMuiHuongs.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        this.isLoading = false;
        this.filterMuiHuongs(); // Áp dụng lọc nếu có từ khóa
        console.log('Danh sách mùi hương:', this.muiHuongs);
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải danh sách mùi hương: ' + error.message;
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
    this.filterMuiHuongs(); // Cập nhật danh sách lọc và phân trang
    this.closeAddModal();
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
          this.errorMessage = 'Không thể xóa mùi hương: ' + error.message;
          this.closeDeleteModal();
        }
      });
    }
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.updateDisplayedMuiHuongs();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.updateDisplayedMuiHuongs();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.updateDisplayedMuiHuongs();
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