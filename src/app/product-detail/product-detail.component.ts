import { Component, OnInit } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { DetailService } from '../service/detail_product';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'], // Sửa từ `styleUrl` thành `styleUrls`
})
export class ProductDetailComponent implements OnInit {
  product: any = null; // Lưu trữ thông tin sản phẩm
  recommendedProducts: any[] = [];
  constructor(
    private route: ActivatedRoute, // Lấy ID từ URL
    private detailService: DetailService, // Service để gọi API
    private router: Router
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (productId) {
      this.loadProductDetail(parseInt(productId, 10));
      this.loadRecommendedProducts();
    }
  }

  loadProductDetail(id: number): void {
    this.detailService.getProductDetailById(id).subscribe({
      next: (data: any) => {
        this.product = data; // Gán dữ liệu sản phẩm
      },
      error: (err: any) => {
        console.error('Lỗi khi tải thông tin sản phẩm:', err);
        if (err.status === 404) {
          alert('Không tìm thấy sản phẩm!'); // Hiển thị thông báo lỗi
          this.router.navigate(['/']); // Điều hướng về trang chủ
        } else if (err.status === 401) {
          alert('Bạn không có quyền truy cập!');
          this.router.navigate(['/login']); // Điều hướng về trang đăng nhập
        }
      },
    });
  }
  loadRecommendedProducts(): void {
    this.detailService.getRecommendedProducts().subscribe({
      next: (data: any[]) => {
        this.recommendedProducts = data;
      },
      error: (err: any) => {
        console.error('Lỗi khi tải danh sách sản phẩm gợi ý:', err);
      },
    });
  }
}
