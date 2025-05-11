import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SanPhamService } from '../service/product.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { NhomHuongService } from '../service/nhomhuong.service';
import { ThuongHieuService } from '../service/thuonghieu.service';
import { ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WebSocketService } from '../service/WebSocketService';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule, FormsModule, MatSliderModule, ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  sanPhams: any[] = [];
  bestSellingProducts: any[] = [];
  page: number = 0;
  size: number = 16;
  totalPages: number = 1;
  visiblePages: number[] = [];

  query: string = '';
  minPrice: number = 100000;
  maxPrice: number = 10000000;
  selectedMinPrice: number = 100000;
  selectedMaxPrice: number = 10000000;

  categories: any[] = [];
  tenNhomHuongs: any[] = [];
  tenThuongHieus: any[] = [];
  quocGias: any[] = [];

  isLoading: boolean = false;
  isBestSellingLoading: boolean = false;

  selectedFilters = {
    searchQuery: '',
    tenDanhMuc: '',
    tenThuongHieu: '',
    tenNhomHuong: '',
    quocGia: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sort: '' as string,
  };

  private webSocketSubscription: Subscription | undefined;

  // Banner Slider
  slides = [
    { image: '/banner.jpg', loaded: false },
    { image: '/banner1.jpg', loaded: false },
    { image: '/banner2.jpg', loaded: false },
    { image: '/banner3.jpg', loaded: false }
  ];
  currentSlide: number = 0;
  slideInterval: any;
  isTransitioning: boolean = false;

  constructor(
    private sanPhamService: SanPhamService,
    private router: Router,
    private nhomHuongService: NhomHuongService,
    private thuongHieuService: ThuongHieuService,
    private webSocketService: WebSocketService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('[HomeComponent] Đang khởi tạo component');
    this.fetchFilters();
    this.loadProducts();
    this.loadBestSellingProducts();

    const userId = 0;
    console.log(`[HomeComponent] Kết nối WebSocket cho userId: ${userId}`);
    this.webSocketService.connect(userId);

    this.webSocketSubscription = this.webSocketService.getProductUpdates().subscribe({
      next: (update: any) => {
        console.log('[HomeComponent] Nhận cập nhật sản phẩm:', update);
        if (update && typeof update === 'object' && update.id != null && update.trangThai != null) {
          const productId = update.id;
          const trangThai = update.trangThai;

          if (trangThai === 0) {
            const oldLength = this.sanPhams.length;
            this.sanPhams = this.sanPhams.filter(product => String(product.idSanPham) !== String(productId));
            this.bestSellingProducts = this.bestSellingProducts.filter(product => String(product.idSanPham) !== String(productId));
            if (this.sanPhams.length < oldLength && this.sanPhams.length === 0 && this.page > 0) {
              this.page--;
              this.loadProducts();
            } else {
              this.updateVisiblePages();
            }
          } else if (trangThai === 1) {
            const productExists = this.sanPhams.some(product => String(product.idSanPham) === String(productId));
            if (!productExists) {
              this.loadProducts();
            } else {
              this.sanPhams = this.sanPhams.map(product => {
                if (String(product.idSanPham) === String(productId)) {
                  console.log(`[HomeComponent] Cập nhật sản phẩm với ID ${productId} thành trangThai = 1`);
                  return { ...product, trangThai: 1 };
                }
                return product;
              });
            }
            this.loadBestSellingProducts();
          }
        } else {
          console.warn('[HomeComponent] Dữ liệu WebSocket không hợp lệ:', update);
        }
      },
      error: (err) => console.error('[HomeComponent] Lỗi WebSocket:', err),
    });

    this.preloadSlides().then(() => {
      this.startAutoSlide();
    });
  }

  ngOnDestroy(): void {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
    console.log('[HomeComponent] Ngắt kết nối WebSocket và hủy đăng ký');
    this.stopAutoSlide();
  }

  fetchFilters(): void {
    this.thuongHieuService.getThuonghieu().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.tenThuongHieus = Array.from(new Set(data.map((item: any) => item.tenThuongHieu)));
          this.quocGias = Array.from(new Set(data.map((item: any) => item.quocGia)));
        }
      },
      error: (err: any) => console.error('[HomeComponent] Lỗi khi lấy thương hiệu:', err),
    });

    this.nhomHuongService.getNhomHuong().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.tenNhomHuongs = Array.from(new Set(data.map((item: any) => item.tenNhomHuong)));
        }
      },
      error: (err: any) => console.error('[HomeComponent] Lỗi khi lấy nhóm hương:', err),
    });

    const queryParams = {
      searchQuery: '',
      minPrice: null,
      maxPrice: null,
      tenDanhMuc: '',
      tenNhomHuong: '',
      tenThuongHieu: '',
      quocGia: '',
      page: 0,
      size: this.size,
      sort: '',
    };

    this.sanPhamService.searchFilterSanPham(queryParams).subscribe({
      next: (data: any) => {
        this.categories = Array.from(new Set(data.content.map((item: any) => item.tenDanhMuc)));
      },
      error: (err: any) => console.error('[HomeComponent] Lỗi khi lấy danh mục:', err),
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    const queryParams = {
      searchQuery: this.selectedFilters.searchQuery || '',
      minPrice: this.selectedFilters.minPrice || null,
      maxPrice: this.selectedFilters.maxPrice || null,
      tenDanhMuc: this.selectedFilters.tenDanhMuc || '',
      tenNhomHuong: this.selectedFilters.tenNhomHuong || '',
      tenThuongHieu: this.selectedFilters.tenThuongHieu || '',
      quocGia: this.selectedFilters.quocGia || '',
      page: this.page,
      size: this.size,
      sort: this.selectedFilters.sort || '',
    };

    this.sanPhamService.searchFilterSanPham(queryParams).subscribe({
      next: (data: any) => {
        console.log('[HomeComponent] Sản phẩm đã được tải:', data);
        this.sanPhams = data.content || [];
        this.totalPages = data.page?.totalPages || 1;
        this.updateVisiblePages();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('[HomeComponent] Lỗi khi tải sản phẩm:', err);
        this.sanPhams = [];
        this.totalPages = 1;
        this.visiblePages = [];
        this.isLoading = false;
      },
    });
  }

  isNewProduct(createDate: string | Date): boolean {
    const today = new Date();
    const productDate = new Date(createDate);
    const timeDiff = today.getTime() - productDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 10;
  }

  loadBestSellingProducts(): void {
    this.isBestSellingLoading = true;
    this.sanPhamService.getBestSellingProducts(5).subscribe({
      next: (data: any) => {
        this.bestSellingProducts = data || [];
        console.log('[HomeComponent] Sản phẩm bán chạy đã được tải:', this.bestSellingProducts);
        this.isBestSellingLoading = false;
      },
      error: (err: any) => {
        console.error('[HomeComponent] Lỗi khi tải sản phẩm bán chạy:', err);
        this.bestSellingProducts = [];
        this.isBestSellingLoading = false;
      },
    });
  }

  sortProducts(sortOption: string): void {
    console.log('[HomeComponent] Sắp xếp sản phẩm với tùy chọn:', sortOption);
    this.selectedFilters.sort = sortOption;
    this.page = 0;
    this.loadProducts();
  }

  updateVisiblePages(): void {
    const pagesToShow = 5;
    const startPage = Math.max(0, this.page - Math.floor(pagesToShow / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + pagesToShow - 1);
    this.visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    console.log('[HomeComponent] Cập nhật các trang hiển thị:', this.visiblePages);
  }

  viewProductDetail(productId: number): void {
    if (productId) {
      console.log('[HomeComponent] Điều hướng đến chi tiết sản phẩm:', productId);
      this.router.navigate([`/detail/${productId}`]);
    } else {
      console.warn('[HomeComponent] ID sản phẩm không hợp lệ cho điều hướng');
    }
  }

  onSearch(): void {
    this.selectedFilters.searchQuery = this.query.trim();
    this.page = 0;
    this.loadProducts();
  }

  // Xử lý sự kiện queryChange từ HeaderComponent
  onQueryChange(newQuery: string): void {
    this.query = newQuery;
    this.onSearch();
  }

  applyFilter(type: string): void {
    this.page = 0;
    this.loadProducts();
  }

  filterByPrice(): void {
    this.selectedFilters.minPrice = this.selectedMinPrice;
    this.selectedFilters.maxPrice = this.selectedMaxPrice;
    this.page = 0;
    this.loadProducts();
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      this.page = p;
      console.log('[HomeComponent] Điều hướng đến trang:', this.page);
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      console.log('[HomeComponent] Điều hướng đến trang trước:', this.page);
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      console.log('[HomeComponent] Điều hướng đến trang tiếp theo:', this.page);
      this.loadProducts();
    }
  }

  getPaginationRange(): number[] {
    const range: number[] = [];
    const pagesToShow = 5;
    const start = Math.max(0, this.page - Math.floor(pagesToShow / 2));
    const end = Math.min(this.totalPages, start + pagesToShow);

    for (let i = start; i < end; i++) {
      range.push(i);
    }
    console.log('[HomeComponent] Phạm vi phân trang:', range);
    return range;
  }

  // Phương thức cho Slider Banner
  startAutoSlide(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    this.isTransitioning = true;
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.ensureSlideLoaded(nextIndex).then(() => {
      this.currentSlide = nextIndex;
      console.log(`[HomeComponent] Chuyển đến slide ${this.currentSlide + 1}: ${this.slides[this.currentSlide].image}`);
      this.cdr.detectChanges();
      this.isTransitioning = false;
      this.stopAutoSlide();
      this.startAutoSlide();
    });
  }

  prevSlide(): void {
    this.isTransitioning = true;
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.ensureSlideLoaded(prevIndex).then(() => {
      this.currentSlide = prevIndex;
      console.log(`[HomeComponent] Chuyển đến slide ${this.currentSlide + 1}: ${this.slides[this.currentSlide].image}`);
      this.cdr.detectChanges();
      this.isTransitioning = false;
      this.stopAutoSlide();
      this.startAutoSlide();
    });
  }

  goToSlide(index: number): void {
    this.isTransitioning = true;
    this.ensureSlideLoaded(index).then(() => {
      this.currentSlide = index;
      console.log(`[HomeComponent] Chuyển đến slide ${this.currentSlide + 1}: ${this.slides[this.currentSlide].image}`);
      this.cdr.detectChanges();
      this.isTransitioning = false;
      this.stopAutoSlide();
      this.startAutoSlide();
    });
  }

  preloadSlides(): Promise<void> {
    return new Promise((resolve) => {
      let loadedCount = 0;
      this.slides.forEach((slide, index) => {
        const img = new Image();
        img.src = slide.image;
        img.onload = () => {
          slide.loaded = true;
          loadedCount++;
          console.log(`[HomeComponent] Đã tải trước slide ${index + 1}: ${slide.image}`);
          this.cdr.detectChanges();
          if (loadedCount === this.slides.length) {
            resolve();
          }
        };
        img.onerror = () => {
          console.error(`[HomeComponent] Lỗi khi tải trước slide ${index + 1}: ${slide.image}`);
          slide.image = `https://placehold.co/1200x360?text=Slide+${index + 1}`;
          slide.loaded = true;
          loadedCount++;
          this.cdr.detectChanges();
          if (loadedCount === this.slides.length) {
            resolve();
          }
        };
      });
    });
  }

  ensureSlideLoaded(index: number): Promise<void> {
    return new Promise((resolve) => {
      const slide = this.slides[index];
      if (slide.loaded) {
        resolve();
        return;
      }
      const img = new Image();
      img.src = slide.image;
      img.onload = () => {
        slide.loaded = true;
        console.log(`[HomeComponent] Đã tải slide ${index + 1}: ${slide.image}`);
        this.cdr.detectChanges();
        resolve();
      };
      img.onerror = () => {
        console.error(`[HomeComponent] Lỗi khi tải slide ${index + 1}: ${slide.image}`);
        slide.image = `https://placehold.co/1200x360?text=Slide+${index + 1}`;
        slide.loaded = true;
        this.cdr.detectChanges();
        resolve();
      };
    });
  }

  onImageError(index: number): void {
    const slide = this.slides[index];
    slide.image = `https://placehold.co/1200x360?text=Slide+${index + 1}`;
    slide.loaded = true;
    this.cdr.detectChanges();
  }
}