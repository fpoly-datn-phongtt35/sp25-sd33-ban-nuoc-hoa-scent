import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { DetailService } from '../service/detail_product';
import { CartService } from '../service/cart.Service';
import { SanPhamService } from '../service/product.service';
import { TokenService } from '../service/token.service';
import { DanhGiaService } from '../service/DanhGiaService';
import { WebSocketService } from '../service/WebSocketService';
import { Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [FooterComponent, HeaderComponent, CommonModule, FormsModule],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss'],
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: any;
  recommendedProducts: any[] = [];
  selectedVolume: any;
  imageUrls: string[] = [];
  volumes: any[] = [];
  quantity: number = 1;
  selectedImageIndex: number = 0;
  isLoading: boolean = true;
  danhGias: any[] = [];
  filteredDanhGias: any[] = [];
  selectedStarFilter: number | null = null;
  newRating: number = 0;
  newComment: string = '';
  averageRating: number = 0;
  private inventorySubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private detailService: DetailService,
    private cartService: CartService,
    private sanPhamService: SanPhamService,
    private tokenService: TokenService,
    private danhGiaService: DanhGiaService,
    private webSocketService: WebSocketService
  ) {}

  ngOnInit(): void {
    const userId = this.tokenService.getUserId();
    if (userId > 0) {
      this.webSocketService.connect(userId);
      this.inventorySubscription = this.webSocketService.getInventoryUpdates().subscribe(
        (update: { productId: number; stock: number }) => {
          console.log('📥 Received inventory update in ProductDetailComponent:', update);
          this.updateStock(update.productId, update.stock);
        },
        (error) => console.error('WebSocket error in ProductDetailComponent:', error)
      );
    }

    this.loadProductDetail();
    this.loadRecommendedProducts();
    this.loadVolumes();
    this.loadDanhGias();
  }

  ngOnDestroy(): void {
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }
    // Không gọi disconnect ở đây vì WebSocketService là singleton, dùng chung toàn app
  }

  private updateStock(productId: number, newStock: number): void {
    if (this.volumes) {
      this.volumes = this.volumes.map(volume => {
        if (volume.idSpct === productId) {
          volume.soLuongTonKho = newStock;
          if (this.selectedVolume && this.selectedVolume.idSpct === productId) {
            this.selectedVolume.soLuongTonKho = newStock;
            this.product.soLuongTonKho = newStock;
          }
        }
        return volume;
      });
      console.log('🛒 Updated volumes with new stock:', this.volumes);
    }
  }

  loadProductDetail(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericProductId = parseInt(productId, 10);
      if (!isNaN(numericProductId)) {
        this.sanPhamService.getProductVolumes(numericProductId).subscribe((volumes: any[]) => {
          this.volumes = volumes;
          if (volumes.length > 0) {
            this.selectedVolume = volumes[0];
          }
        });

        this.detailService.getProductDetailById(numericProductId).subscribe({
          next: (data: any) => {
            if (data && data.length > 0) {
              this.product = { ...data[0] };
              if (this.product.imageURL) {
                this.imageUrls = this.product.imageURL.split(',').map((url: string) => url.trim());
              }
              console.log('Sản phẩm:', this.product);
            } else {
              Swal.fire('Không tìm thấy sản phẩm', '', 'error');
            }
            this.isLoading = false;
          },
          error: (err) => {
            this.isLoading = false;
            console.error('Lỗi khi tải sản phẩm:', err);
            Swal.fire('Lỗi khi tải sản phẩm', '', 'error');
          },
        });
      }
    }
  }

  loadVolumes(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericProductId = parseInt(productId, 10);
      if (!isNaN(numericProductId)) {
        this.sanPhamService.getProductVolumes(numericProductId).subscribe({
          next: (volumes: any[]) => {
            this.volumes = volumes;
            this.selectedVolume = volumes.length > 0 ? volumes[0] : null;
          },
          error: (err) => console.error('Error fetching volumes:', err),
        });
      }
    }
  }

  loadRecommendedProducts(): void {
    this.detailService.getRecommendedProducts().subscribe({
      next: (data: any[]) => (this.recommendedProducts = data),
      error: (err) => console.error('Lỗi khi tải sản phẩm gợi ý:', err),
    });
  }

  loadDanhGias(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericProductId = parseInt(productId, 10);
      if (!isNaN(numericProductId)) {
        this.danhGiaService.getDanhGiaBySanPham(numericProductId).subscribe({
          next: (res) => {
            this.danhGias = res;
            this.applyFilter();
            this.calculateAverageRating();
          },
          error: (err) => {
            console.error('Lỗi khi lấy danh sách đánh giá:', err);
          },
        });
      }
    }
  }

  calculateAverageRating(): void {
    if (this.danhGias.length > 0) {
      const totalRating = this.danhGias.reduce((sum, danhGia) => sum + danhGia.rating, 0);
      this.averageRating = totalRating / this.danhGias.length;
    } else {
      this.averageRating = 0;
    }
  }

  scrollImages(direction: string): void {
    if (direction === 'up' && this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    } else if (direction === 'down' && this.selectedImageIndex < this.imageUrls.length - 1) {
      this.selectedImageIndex++;
    }
  }

  setMainImage(index: number): void {
    this.selectedImageIndex = index;
  }

  selectVolume(volume: any): void {
    this.selectedVolume = volume;
    this.product.dungTich = volume.dungTich;
    this.product.donGia = volume.donGia;
    this.product.idSpct = volume.idSpct;
    this.product.soLuongTonKho = volume.soLuongTonKho;

    console.log(`Giá cập nhật: ${this.product.donGia} VND cho ${this.selectedVolume.dungTich}ml`);
  }

  updateDisplayedPrice(): void {
    if (this.selectedVolume) {
      console.log(`Giá: ${this.selectedVolume.donGia} cho dung tích ${this.selectedVolume.dungTich}ml`);
    }
  }

  addToCart(): void {
    if (!this.selectedVolume) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn dung tích',
        text: 'Vui lòng chọn dung tích trước khi thêm vào giỏ hàng!',
        position: 'bottom-end',
      });
      return;
    }

    if (!this.product || !this.product.idSanPham) {
      console.error('❌ Lỗi: Thông tin sản phẩm bị thiếu!', this.product);
      return;
    }

    if (this.quantity > this.product.soLuongTonKho) {
      Swal.fire({
        icon: 'error',
        title: 'Số lượng vượt quá tồn kho',
        text: `Chỉ còn ${this.product.soLuongTonKho} sản phẩm!`,
        position: 'bottom-end',
      });
      return;
    }

    if (this.quantity < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Số lượng không hợp lệ',
        text: 'Số lượng phải lớn hơn 0!',
        position: 'bottom-end',
      });
      this.quantity = 1;
      return;
    }

    const productCopy = {
      ...this.product,
      dungTich: this.selectedVolume.dungTich,
      donGia: this.selectedVolume.donGia,
    };

    this.cartService.addToCart(productCopy, this.quantity);
    this.quantity = 1;
  }

  viewRelatedProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.router.navigate(['/product/detail', productId]).then(() => {
        this.loadProductDetail();
      });
    } else {
      console.error('Product ID is undefined');
    }
  }

  updateProductDetails(product: any): void {
    this.product = product;

    if (product.imageURL) {
      this.imageUrls = product.imageURL.split(',').map((url: string) => url.trim());
    }

    this.volumes = product.volumes?.length
      ? product.volumes
      : [{
          dungTich: product.dungTich,
          donGia: product.donGia,
          soLuongTonKho: product.soLuongTonKho,
        }];

    this.selectedVolume = this.volumes.length > 0 ? this.volumes[0] : null;
    console.log('Thông tin sản phẩm đã được cập nhật:', this.product);
    this.loadDanhGias();
  }

  setRating(rating: number): void {
    this.newRating = rating;
  }

  submitReview(): void {
    const token = this.tokenService.getToken();
    if (!token || this.tokenService.isTokenExpired()) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Bạn cần đăng nhập để gửi đánh giá!',
        position: 'bottom-end',
      });
      this.router.navigate(['login']);
      return;
    }

    if (this.newRating === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn số sao',
        text: 'Vui lòng chọn số sao để đánh giá!',
        position: 'bottom-end',
      });
      return;
    }

    if (!this.newComment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa nhập bình luận',
        text: 'Vui lòng nhập bình luận để gửi đánh giá!',
        position: 'bottom-end',
      });
      return;
    }

    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericProductId = parseInt(productId, 10);
      const reviewData = {
        idSanPham: numericProductId,
        rating: this.newRating,
        comment: this.newComment,
      };

      this.danhGiaService.addDanhGia(reviewData).subscribe({
        next: (res) => {
          Swal.fire({
            icon: 'success',
            title: 'Đánh giá thành công',
            text: 'Cảm ơn bạn đã gửi đánh giá!',
            position: 'bottom-end',
          });
          this.newRating = 0;
          this.newComment = '';
          this.loadDanhGias();
        },
        error: (err) => {
          console.error('Lỗi khi gửi đánh giá:', err);
          Swal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: 'Không thể gửi đánh giá. Vui lòng thử lại!',
            position: 'bottom-end',
          });
        },
      });
    }
  }

  filterByStars(stars: number | null): void {
    this.selectedStarFilter = stars;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.selectedStarFilter === null) {
      this.filteredDanhGias = [...this.danhGias];
    } else {
      this.filteredDanhGias = this.danhGias.filter(
        (danhGia) => danhGia.rating === this.selectedStarFilter
      );
    }
  }
}