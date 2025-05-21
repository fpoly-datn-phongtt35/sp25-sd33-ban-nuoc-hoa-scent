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
import { BannerService, Banner } from '../service/BannerService';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    CommonModule,
    FormsModule,
    MatSliderModule,
    ReactiveFormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  sanPhams: any[] = [];
  bestSellingProducts: any[] = [];
  page: number = 0;
  size: number = 20;
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
  showMinLabel: boolean = false;
  showMaxLabel: boolean = false;
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
  slides: { banner: Banner; loaded: boolean }[] = [];
  currentSlide: number = 0;
  slideInterval: any;
  isTransitioning: boolean = false;
  private baseUrl: string = 'http://localhost:8080';

  constructor(
    private sanPhamService: SanPhamService,
    private router: Router,
    private nhomHuongService: NhomHuongService,
    private thuongHieuService: ThuongHieuService,
    private webSocketService: WebSocketService,
    private bannerService: BannerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchFilters();
    this.loadProducts();
    this.loadBestSellingProducts();
    this.loadBanners();

    const userId = 0;
    this.webSocketService.connect(userId);

    this.webSocketSubscription = this.webSocketService.getProductUpdates().subscribe({
      next: (update: any) => {
        if (update && typeof update === 'object' && update.id != null && update.trangThai != null) {
          const productId = update.id;
          const trangThai = update.trangThai;

          if (trangThai === 0) {
            const oldLength = this.sanPhams.length;
            this.sanPhams = this.sanPhams.filter((product) => String(product.idSanPham) !== String(productId));
            this.bestSellingProducts = this.bestSellingProducts.filter(
              (product) => String(product.idSanPham) !== String(productId)
            );
            if (this.sanPhams.length < oldLength && this.sanPhams.length === 0 && this.page > 0) {
              this.page--;
              this.loadProducts();
            } else {
              this.updateVisiblePages();
            }
          } else if (trangThai === 1) {
            const productExists = this.sanPhams.some(
              (product) => String(product.idSanPham) === String(productId)
            );
            if (!productExists) {
              this.loadProducts();
            } else {
              this.sanPhams = this.sanPhams.map((product) => {
                if (String(product.idSanPham) === String(productId)) {
                  return { ...product, trangThai: 1 };
                }
                return product;
              });
            }
            this.loadBestSellingProducts();
          }
        }
      },
      error: (err) => console.error('[HomeComponent] Lỗi WebSocket:', err),
    });

    this.loadBanners().then(() => {
      this.preloadSlides().then(() => {
        this.startAutoSlide();
      });
    });
  }

  showThumbLabel(type: string) {
    if (type === 'min') this.showMinLabel = true;
    else this.showMaxLabel = true;
  }

  ngOnDestroy(): void {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
    this.stopAutoSlide();
  }

  loadBanners(): Promise<void> {
    return new Promise((resolve) => {
      this.bannerService.getActiveBanners().subscribe({
        next: (banners: Banner[]) => {
          if (banners && banners.length > 0) {
            this.slides = banners.map((banner) => ({
              banner: {
                ...banner,
                imageUrl: banner.imageUrl.startsWith('http') ? banner.imageUrl : `${this.baseUrl}${banner.imageUrl}`,
              },
              loaded: false,
            }));
          } else {
            this.slides = [
              { banner: { id: 0, imageUrl: 'https://placehold.co/1200x360?text=Banner+1', title: '', createdAt: '', updatedAt: '', isActive: 1 } as Banner, loaded: false },
              { banner: { id: 0, imageUrl: 'https://placehold.co/1200x360?text=Banner+2', title: '', createdAt: '', updatedAt: '', isActive: 1 } as Banner, loaded: false },
              { banner: { id: 0, imageUrl: 'https://placehold.co/1200x360?text=Banner+3', title: '', createdAt: '', updatedAt: '', isActive: 1 } as Banner, loaded: false },
              { banner: { id: 0, imageUrl: 'https://placehold.co/1200x360?text=Banner+4', title: '', createdAt: '', updatedAt: '', isActive: 1 } as Banner, loaded: false },
            ];
          }
          this.cdr.detectChanges();
          resolve();
        },
        error: (err) => {
          this.slides = [
            { banner: { id: 0, imageUrl: 'https://placehold.co/1200x360?text=Banner+1', title: '', createdAt: '', updatedAt: '', isActive: 1 } as Banner, loaded: false },
            { banner: { id: 0, imageUrl: 'https://placehold.co/1200x360?text=Banner+2', title: '', createdAt: '', updatedAt: '', isActive: 1 } as Banner, loaded: false },
            { banner: { id: 0, imageUrl: 'https://placehold.co/1200x360?text=Banner+3', title: '', createdAt: '', updatedAt: '', isActive: 1 } as Banner, loaded: false },
            { banner: { id: 0, imageUrl: 'https://placehold.co/1200x360?text=Banner+4', title: '', createdAt: '', updatedAt: '', isActive: 1 } as Banner, loaded: false },
          ];
          this.cdr.detectChanges();
          resolve();
        },
      });
    });
  }

  fetchFilters(): void {
    this.thuongHieuService.getThuonghieu().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.tenThuongHieus = Array.from(new Set(data.map((item: any) => item.tenThuongHieu)));
          this.quocGias = Array.from(new Set(data.map((item: any) => item.quocGia)));
        }
      },
    });

    this.nhomHuongService.getNhomHuong().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.tenNhomHuongs = Array.from(new Set(data.map((item: any) => item.tenNhomHuong)));
        }
      },
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
    });
  }

  loadProducts(): void {
    this.isLoading = true;
    console.log('Sort value:', this.selectedFilters.sort);
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
        this.sanPhams = data.content || [];
        console.log('Sorted products:', this.sanPhams);
        this.totalPages = data.page?.totalPages || 1;
        this.updateVisiblePages();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.sanPhams = [];
        this.totalPages = 1;
        this.visiblePages = [];
        this.isLoading = false;
      },
    });
  }

  hideThumbLabel(type: string) {
    if (type === 'min') this.showMinLabel = false;
    else this.showMaxLabel = false;
  }

  isNewProduct(createDate: string | Date): boolean {
    const today = new Date();
    const productDate = new Date(createDate);
    const timeDiff = today.getTime() - productDate.getTime();
    const daysDiff = timeDiff / (1000 * 3600 * 24);
    return daysDiff <= 40;
  }

  loadBestSellingProducts(): void {
    this.isBestSellingLoading = true;
    this.sanPhamService.getBestSellingProducts(5).subscribe({
      next: (data: any) => {
        this.bestSellingProducts = data || [];
        this.isBestSellingLoading = false;
      },
      error: (err: any) => {
        this.bestSellingProducts = [];
        this.isBestSellingLoading = false;
      },
    });
  }

  sortProducts(sortOption: string): void {
    this.selectedFilters.sort = sortOption;
    this.page = 0;
    this.loadProducts();
  }

  updateVisiblePages(): void {
    const pagesToShow = 5;
    const startPage = Math.max(0, this.page - Math.floor(pagesToShow / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + pagesToShow - 1);
    this.visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  }

  viewProductDetail(productId: number): void {
    if (productId) {
      this.router.navigate([`/detail/${productId}`]);
    }
  }

  onSearch(): void {
    this.selectedFilters.searchQuery = this.query.trim();
    this.page = 0;
    this.loadProducts();
  }

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
      this.loadProducts();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
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
    return range;
  }

  startAutoSlide(): void {
    if (this.slides.length > 1) {
      this.slideInterval = setInterval(() => {
        this.nextSlide();
      }, 5000);
    }
  }

  stopAutoSlide(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  nextSlide(): void {
    if (this.slides.length === 0) return;
    this.isTransitioning = true;
    const nextIndex = (this.currentSlide + 1) % this.slides.length;
    this.ensureSlideLoaded(nextIndex).then(() => {
      this.currentSlide = nextIndex;
      this.cdr.detectChanges();
      this.isTransitioning = false;
      this.stopAutoSlide();
      this.startAutoSlide();
    });
  }

  prevSlide(): void {
    if (this.slides.length === 0) return;
    this.isTransitioning = true;
    const prevIndex = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
    this.ensureSlideLoaded(prevIndex).then(() => {
      this.currentSlide = prevIndex;
      this.cdr.detectChanges();
      this.isTransitioning = false;
      this.stopAutoSlide();
      this.startAutoSlide();
    });
  }

  goToSlide(index: number): void {
    if (this.slides.length === 0) return;
    this.isTransitioning = true;
    this.ensureSlideLoaded(index).then(() => {
      this.currentSlide = index;
      this.cdr.detectChanges();
      this.isTransitioning = false;
      this.stopAutoSlide();
      this.startAutoSlide();
    });
  }

  preloadSlides(): Promise<void> {
    return new Promise((resolve) => {
      if (this.slides.length === 0) {
        resolve();
        return;
      }
      let loadedCount = 0;
      this.slides.forEach((slide, index) => {
        const img = new Image();
        img.src = slide.banner.imageUrl;
        img.onload = () => {
          slide.loaded = true;
          loadedCount++;
          this.cdr.detectChanges();
          if (loadedCount === this.slides.length) {
            resolve();
          }
        };
        img.onerror = () => {
          slide.banner.imageUrl = `https://placehold.co/1200x360?text=Banner+${index + 1}`;
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
      img.src = slide.banner.imageUrl;
      img.onload = () => {
        slide.loaded = true;
        this.cdr.detectChanges();
        resolve();
      };
      img.onerror = () => {
        slide.banner.imageUrl = `https://placehold.co/1200x360?text=Banner+${index + 1}`;
        slide.loaded = true;
        this.cdr.detectChanges();
        resolve();
      };
    });
  }

  onImageError(index: number): void {
    const slide = this.slides[index];
    slide.banner.imageUrl = `https://placehold.co/1200x360?text=Banner+${index + 1}`;
    slide.loaded = true;
    this.cdr.detectChanges();
  }
}