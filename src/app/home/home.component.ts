import { Component, OnInit, OnDestroy } from '@angular/core';
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
  page: number = 0;
  size: number = 12;
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

  selectedFilters = {
    searchQuery: '',
    tenDanhMuc: '',
    tenThuongHieu: '',
    tenNhomHuong: '',
    quocGia: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
  };

  private webSocketSubscription: Subscription | undefined;

  constructor(
    private sanPhamService: SanPhamService,
    private router: Router,
    private nhomHuongService: NhomHuongService,
    private thuongHieuService: ThuongHieuService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    console.log('[HomeComponent] Initializing component');
    this.fetchFilters();
    this.loadProducts();

    // Kết nối WebSocket với userId (giả sử userId là 0 nếu không có user đăng nhập)
    const userId = 0; // Thay bằng userId thực tế nếu có
    console.log(`[HomeComponent] Connecting WebSocket for userId: ${userId}`);
    this.webSocketService.connect(userId);

    // Lắng nghe cập nhật sản phẩm từ WebSocket
    this.webSocketSubscription = this.webSocketService.getProductUpdates().subscribe({
      next: (update: any) => {
        console.log('[HomeComponent] Product update received:', update);

        // Đảm bảo sử dụng đúng tên thuộc tính (id từ SpMessage)
        const productId = update.id; // Thuộc tính id từ SpMessage
        const trangThai = update.trangThai;

        if (trangThai === 0) {
          // Sản phẩm ngưng bán, xóa khỏi danh sách hiển thị
          const oldLength = this.sanPhams.length;
          this.sanPhams = this.sanPhams.filter(product => {
            const keep = String(product.idSanPham) !== String(productId);
            if (!keep) {
             
            }
            return keep;
          });

          // Cập nhật phân trang nếu cần
          if (this.sanPhams.length < oldLength && this.sanPhams.length === 0 && this.page > 0) {
            this.page--;
            this.loadProducts();
          } else {
            this.updateVisiblePages();
          }
        } else if (trangThai === 1) {
          // Sản phẩm được kích hoạt lại
          const productExists = this.sanPhams.some(product => String(product.idSanPham) === String(productId));
          if (!productExists) {
            
            this.loadProducts(); // Tải lại danh sách để hiển thị sản phẩm
          } else {
            this.sanPhams = this.sanPhams.map(product => {
              if (String(product.idSanPham) === String(productId)) {
                console.log(`[HomeComponent] Updated product with ID ${productId} to trangThai = 1`);
                return { ...product, trangThai: 1 };
              }
              return product;
            });
          }
        }
      },
      error: (err) => {
        console.error('[HomeComponent] WebSocket error:', err);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }
    this.webSocketService.disconnect();
    console.log('[HomeComponent] Disconnected WebSocket and unsubscribed');
  }

  fetchFilters(): void {
    this.thuongHieuService.getThuonghieu().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.tenThuongHieus = Array.from(new Set(data.map((item: any) => item.tenThuongHieu)));
          this.quocGias = Array.from(new Set(data.map((item: any) => item.quocGia)));
          
        }
      },
      error: (err: any) => console.error('[HomeComponent] Failed to get thuong hieu:', err),
    });

    this.nhomHuongService.getnhomHuong().subscribe({
      next: (data: any) => {
        if (Array.isArray(data)) {
          this.tenNhomHuongs = Array.from(new Set(data.map((item: any) => item.tenNhomHuong)));
          
        }
      },
      error: (err: any) => console.error('[HomeComponent] Failed to get nhom huong:', err),
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
    };

    this.sanPhamService.searchFilterSanPham(queryParams).subscribe({
      next: (data: any) => {
        this.categories = Array.from(new Set(data.content.map((item: any) => item.tenDanhMuc)));
        
      },
      error: (err: any) => console.error('[HomeComponent] Failed to get categories:', err),
    });
  }

  loadProducts(): void {
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
    };

   

    this.sanPhamService.searchFilterSanPham(queryParams).subscribe({
      next: (data: any) => {
        this.sanPhams = data.content || [];
        this.totalPages = data.page?.totalPages || 1;
        this.updateVisiblePages();
       
      },
      error: (err: any) => {
       
        this.sanPhams = [];
        this.totalPages = 1;
        this.visiblePages = [];
      },
    });
  }

  updateVisiblePages(): void {
    const pagesToShow = 5;
    const startPage = Math.max(0, this.page - Math.floor(pagesToShow / 2));
    const endPage = Math.min(this.totalPages - 1, startPage + pagesToShow - 1);
    this.visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
   
  }

  viewProductDetail(productId: number): void {
    if (productId) {
      console.log('[HomeComponent] Navigating to product detail:', productId);
      this.router.navigate([`/detail/${productId}`]);
    } else {
      console.warn('[HomeComponent] Invalid productId for navigation');
    }
  }

  onSearch(): void {
    this.selectedFilters.searchQuery = this.query.trim();
    this.page = 0;
   
    this.loadProducts();
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
      console.log('[HomeComponent] Navigating to previous page:', this.page);
      this.loadProducts();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      console.log('[HomeComponent] Navigating to next page:', this.page);
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
    console.log('[HomeComponent] Pagination range:', range);
    return range;
  }
}