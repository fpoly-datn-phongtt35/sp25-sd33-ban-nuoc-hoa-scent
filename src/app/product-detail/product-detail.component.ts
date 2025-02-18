import { Component, OnInit } from '@angular/core';

import { DetailService } from '../service/detail_product';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { CartService } from '../service/cart.Service';


@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, CommonModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'], // Sửa từ `styleUrl` thành `styleUrls`
})
export class ProductDetailComponent implements OnInit {
  product: any; // Giả sử đây là đối tượng sản phẩm hiện tại
  recommendedProducts: any[] | undefined; // Danh sách các sản phẩm liên quan
  isLoading = true;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private detailService: DetailService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.loadProductDetail();
    this.loadRecommendedProducts();

    
  }

  loadProductDetail(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.detailService.getProductDetailById(parseInt(productId, 10)).subscribe({
        next: (data: any) => {
          this.product = data;
          console.log('Product loaded:', this.product); // Kiểm tra dữ liệu sản phẩm
          this.isLoading = false;
        },
        error: (err: any) => {
          this.isLoading = false; 
          console.error('Error loading product detail:', err);
          alert('Error loading product detail');
        }
      });
    } else {
      console.error('Product ID is missing');
      alert('Product ID is missing');
    }
  }
  

  loadRecommendedProducts(): void {
    this.detailService.getRecommendedProducts().subscribe({
      next: (data: any[]) => this.recommendedProducts = data,
      error: (err: any) => console.error('Error loading recommended products:', err)
    });
  }

  addToCart(): void {
    console.log('Product being added:', this.product);
    // Kiểm tra chỉ các thuộc tính cần thiết
    if (!this.product || !this.product.productId) {
      alert('Product details are missing or not fully loaded');
      console.log('Product ID:', this.product?.productId);
console.log('Product Name:', this.product?.productName);
console.log('Product Price:', this.product?.price);

      return;
    }
    this.cartService.addToCart(this.product, 1);
    alert('Product added to cart!');
  }
  
  
  

  

  viewRelatedProduct(productId: number): void {
    this.router.navigate(['/product/detail', productId]);
  }
}
