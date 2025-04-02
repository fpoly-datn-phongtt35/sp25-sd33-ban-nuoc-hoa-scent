import { ThuongHieuService } from './../service/thuonghieu.service';
import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { SanPhamService } from '../service/product.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { NhomHuongService } from '../service/nhomhuong.service';
import { ReactiveFormsModule } from '@angular/forms';  // Thêm dòng này vào

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeaderComponent, FooterComponent, CommonModule,FormsModule,MatSliderModule,ReactiveFormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'], // Sửa từ styleUrl thành styleUrls
})
export class HomeComponent implements OnInit {
  sanPhams: any[] = [];
  ThuongHieus: any[]=[];
  filteredSanPhams: any[] = [];
  currentPage: number = 1; // Trang hiện tại (1-based index)
  totalPages: number = 0; // Tổng số trang
  pageSize: number = 12; // Số sản phẩm mỗi trang
  visiblePages: number[] = []; // Các trang hiển thị
  query: string = '';
  results: any[] = [];
  minPrice: number = 100000; // Giá tối thiểu
  maxPrice: number = 10000000; // Giá tối đa
  selectedMinPrice: number = 100000; // Giá bắt đầu
  selectedMaxPrice: number = 10000000; // Giá kết thúc
  currentCategory: string = '';

  categories: any[] = [];
  tennhomhuongs: any[]=[];
  tenThuonghieu:any[]=[];
  quocGia:any[]=[];
  selectedFilters: any = {
    category: '',  // Đảm bảo là chuỗi
    brand: '',  // Đảm bảo là chuỗi
    scent: '',  // Đảm bảo là chuỗi
    country: '',  // Đảm bảo là chuỗi
  };
  constructor(private sanPhamService: SanPhamService,private router: Router,private nhomHuongService:NhomHuongService,private thuongHieuService:ThuongHieuService) {}

  ngOnInit(): void {
    this.fetchSanPhamDetails();
    this.fetNhomHuong();
    this.fetThuongHieu();
    this.onPageChange(1);
  }
fetThuongHieu(): void {
  this.thuongHieuService.getThuonghieu().subscribe({
    next: (data: any) => {
      // Kiểm tra nếu data là mảng và xử lý đúng
      if (Array.isArray(data)) {
        this.tenThuonghieu = Array.from(new Set(data.map((item: any) => item.tenThuongHieu)));
        this.quocGia = Array.from(new Set(data.map((item: any) => item.quocGia)));
        console.log('Thương hiệu:',this.tenThuonghieu)
        console.log('QuocGia',this.quocGia)
      } else {
        console.error('Unexpected data structure:', data);
      }
    },
    error: (err: any) => {
      console.error('Failed to get categories:', err);
    }
  });
}
  fetNhomHuong(): void {
    this.nhomHuongService.getnhomHuong().subscribe({
      next: (data: any) => {
        // Kiểm tra nếu data là mảng và xử lý đúng
        if (Array.isArray(data)) {
          this.tennhomhuongs = Array.from(new Set(data.map((item: any) => item.tenNhomHuong)));
          console.log('Nhóm hương:',this.tennhomhuongs)
        } else {
          console.error('Unexpected data structure:', data);
        }
      },
      error: (err: any) => {
        console.error('Failed to get categories:', err);
      }
    });
  }



  fetchSanPhamDetails(): void {
    this.sanPhamService.getSanPhamDetails(this.currentPage - 1, this.pageSize).subscribe(
        (data: any) => {
          this.categories = Array.from(new Set(data.content.map((item: any) => item.tenDanhMuc)));
this.ThuongHieus = Array.from(new Set(data.content.map((item: any) => item.tenThuongHieu)));
          console.log(this.categories)
          console.log(this.ThuongHieus)
            console.log("📥 API Response:", data); // Kiểm tra dữ liệu API trả về
            this.sanPhams = data.content;
            this.totalPages = data.page?.totalPages ?? 1;  // Sửa lỗi lấy totalPages
            console.log("🔢 Tổng số trang:", this.totalPages);
            this.updateVisiblePages();
        },
        (error: any) => {
            console.error("❌ Lỗi khi gọi API:", error);
        }
    );
}



  // Chuyển đến trang mới






  // Cập nhật các trang hiển thị
  updateVisiblePages(): void {
    const pagesToShow = 5; // Hiển thị tối đa 5 trang
    const startPage = Math.max(1, this.currentPage - Math.floor(pagesToShow / 2));
    const endPage = Math.min(this.totalPages, startPage + pagesToShow - 1);
    this.visiblePages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i); // Cập nhật visiblePages
  }


  onPageChange(page: number): void {
    console.log("🔄 Chuyển sang trang:", page);

    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      console.log("📌 Trang hiện tại sau cập nhật:", this.currentPage);

      // Gọi lại API với trang mới và các bộ lọc đã chọn
      this.filterProducts();
    } else {
      console.warn("⚠️ Trang yêu cầu không hợp lệ:", page);
    }
  }





  viewProductDetail(productId: number): void {
    if (productId) {
      this.router.navigate([`/detail/${productId}`]); // Đảm bảo `productId` hợp lệ
    } else {
      console.error('Product ID is invalid:', productId); // Log lỗi nếu `productId` không hợp lệ
    }
  }

  onSearch(): void {
    if (this.query.trim()) {
      this.currentPage = 1; // Reset to the first page for new search
      this.loadSearchResults(); // Call to load search results based on the query
    } else {
      this.fetchSanPhamDetails(); // Fetch all products when there is no query
    }
  }

  loadSearchResults(): void {
    this.sanPhamService.searchProducts(this.query.trim(), this.currentPage - 1, this.pageSize).subscribe({
      next: (data: any) => {
        console.log('text:', data);
        this.sanPhams = data.content; // Cập nhật danh sách sản phẩm
        this.totalPages = data.totalPages; // Cập nhật tổng số trang
        this.updateVisiblePages(); // Cập nhật các trang hiển thị
      },
      error: (error: any) => {
        console.error('Search error:', error);
        this.sanPhams = []; // Đặt mảng sản phẩm thành rỗng khi có lỗi
      },
      complete: () => console.log('Search completed')
    });
  }


  fetchSanPhamDetailsPrice(): void {
    this.sanPhamService.searchSanPhamByPrice(this.selectedMinPrice, this.selectedMaxPrice,this.currentPage -1,this.pageSize).subscribe(
      (data: any) => {
        console.log('lọc:',data);
        this.sanPhams = data.content;

        this.totalPages = data.totalPages;
        this.updateVisiblePages();
      },
      (error: any) => console.error('Lỗi khi gọi API:', error)
    );
  }

  applyFilter(type: string, value: string): void {
    // Lấy giá trị đã chọn từ sự kiện
    console.log(`Filtering by: ${type}, value: ${value}`);  // Để kiểm tra dữ liệu

    // Lưu giá trị vào selectedFilters
    if (type === 'category') {
      this.selectedFilters.category = value;
    } else if (type === 'brand') {
      this.selectedFilters.brand = value;
    } else if (type === 'scent') {
      this.selectedFilters.scent = value;
    } else if (type === 'country') {
      this.selectedFilters.country = value;
    }

    // Gọi hàm lọc sản phẩm
    this.filterProducts();
  }

  toggleFilter(filterType: string, event: Event): void {
    const target = event.target as HTMLSelectElement;  // Ép kiểu về HTMLSelectElement
    const value = target.value;  // Truy cập giá trị của thẻ select

    const index = this.selectedFilters[filterType].indexOf(value);
    if (index === -1) {
      this.selectedFilters[filterType].push(value);
    } else {
      this.selectedFilters[filterType].splice(index, 1);
    }

    this.filterProducts();  // Áp dụng bộ lọc sau khi thay đổi
  }
  filterProducts(): void {
    const { category, brand, scent, country } = this.selectedFilters;

    // Kiểm tra các giá trị lọc đã được chọn
    console.log('Filtering with:', { category, brand, scent, country });

    if (category || brand || scent || country) {
      // Chỉ gọi API khi có bộ lọc đã được chọn
      this.sanPhamService.getProductsByAllField(
        category, brand, scent, country, this.currentPage - 1, this.pageSize
      ).subscribe({
        next: (data: any) => {
          if (data && data.content) {
            this.sanPhams = data.content;
            this.totalPages = data.page?.totalPages ?? 1;
            this.updateVisiblePages();
          } else {
            console.error('Dữ liệu không hợp lệ từ API:', data);
          }
        },
        error: (err) => {
          console.error('Lỗi khi gọi API:', err);
        }
      });
    }
  }






  applyCategoryFilter(value: string): void {
    this.selectedFilters.category = value || null;
    this.filterProducts(); // Sau khi chọn danh mục, gọi hàm lọc lại
  }

  // Cập nhật bộ lọc theo thương hiệu
  applyBrandFilter(value: string): void {
    // Cập nhật bộ lọc theo thương hiệu
    this.selectedFilters.brand = value || null;
    this.filterProducts(); // Sau khi chọn thương hiệu, gọi hàm lọc lại
  }


  filterByPrice(): void {
    console.log(`Lọc giá từ: ${this.selectedMinPrice} đ đến ${this.selectedMaxPrice} đ`);
    this.fetchSanPhamDetailsPrice();
  }
// This method handles the toggling of the collapsible sections
toggleCollapsible(event: any) {
  const content = event.target.nextElementSibling;
  content.style.display = content.style.display === 'block' ? 'none' : 'block';
  event.target.classList.toggle('active');
}

}
