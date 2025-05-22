import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhongCachService } from '../../../service/PhongCach.service';
import { AddPhongCachComponent } from '../add-phong-cach/add-phong-cach.component';
import { UpdatePhongCachComponent } from '../update-phong-cach/update-phong-cach.component';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

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
export class PhongCachComponent implements OnInit, OnDestroy {
  phongCachs: PhongCach[] = [];
  filteredPhongCachs: PhongCach[] = []; // Danh sách phong cách sau khi lọc
  isLoading = false;
  errorMessage = '';
  showAddModal = false;
  showUpdateModal = false;
  showDeleteModal = false;
  selectedPhongCach: PhongCach | null = null;
  phongCachToDelete: number | null = null;

  page: number = 0;
  size: number = 10000; // Đặt pageSize lớn nhất để lấy tất cả phong cách
  totalPages: number = 1;
  totalElements: number = 0;
  searchTerm: string = ''; // Từ khóa tìm kiếm
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription | null = null;

  constructor(private phongCachService: PhongCachService) {}

  ngOnInit(): void {
    this.loadPhongCachs();
    // Thiết lập debounce cho tìm kiếm
    this.searchSubscription = this.searchSubject
      .pipe(debounceTime(150))
      .subscribe((term: string) => {
        this.searchTerm = term;
        this.filterPhongCachs(); // Lọc danh sách phong cách
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

 // Hàm lọc phong cách theo từ khóa
  filterPhongCachs(): void {
    if (!this.searchTerm) {
      this.filteredPhongCachs = [...this.phongCachs];
      this.totalElements = this.phongCachs.length;
      this.totalPages = 1; // Không phân trang khi không tìm kiếm
    } else {
      const searchTermLower = this.removeVietnameseTones(this.searchTerm.toLowerCase());
      this.filteredPhongCachs = this.phongCachs.filter((phongCach: PhongCach) =>
        this.removeVietnameseTones(phongCach.tenPhongCach.toLowerCase()).includes(searchTermLower) ||
        this.removeVietnameseTones((phongCach.moTa || '').toLowerCase()).includes(searchTermLower) ||
        String(phongCach.id).includes(searchTermLower) // Lọc theo id
      );
      this.totalElements = this.filteredPhongCachs.length;
      this.totalPages = 1; // Không phân trang khi tìm kiếm
    }
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
        this.filteredPhongCachs = [...this.phongCachs]; // Khởi tạo danh sách lọc
        this.totalPages = res.page?.totalPages || 1;
        this.totalElements = res.totalElements || 0;
        this.isLoading = false;
        this.filterPhongCachs(); // Áp dụng lọc nếu có từ khóa
        console.log('Danh sách phong cách:', this.phongCachs);
      },
      error: (error) => {
        this.errorMessage = 'Không thể tải danh sách phong cách: ' + error.message;
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
    this.filterPhongCachs(); // Cập nhật danh sách lọc
    this.closeAddModal();
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
          this.errorMessage = 'Không thể xóa phong cách: ' + error.message;
          this.closeDeleteModal();
        }
      });
    }
  }

  // Vô hiệu hóa phân trang khi tìm kiếm
  goToPage(p: number): void {
    if (!this.searchTerm && p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
      this.page = p;
      this.loadPhongCachs();
    }
  }

  prevPage(): void {
    if (!this.searchTerm && this.page > 0) {
      this.page--;
      this.loadPhongCachs();
    }
  }

  nextPage(): void {
    if (!this.searchTerm && this.page < this.totalPages - 1) {
      this.page++;
      this.loadPhongCachs();
    }
  }

  getPaginationRange(): { page: number, isEllipsis: boolean }[] {
    if (this.searchTerm) {
      return []; // Không hiển thị phân trang khi tìm kiếm
    }
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