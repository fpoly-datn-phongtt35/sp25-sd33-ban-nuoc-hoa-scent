import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';
import { DetailService } from '../service/detail_product';
import { CartService, CartItemWithKey } from '../service/cart.Service';
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
  activeVolumes: any[] = [];
  quantity: number = 1;
  selectedImageIndex: number = 0;
  isLoading: boolean = true;
  danhGias: any[] = [];
  filteredDanhGias: any[] = [];
  displayedDanhGias: any[] = [];
  selectedStarFilter: number | null = null;
  newRating: number = 0;
  newComment: string = '';
  averageRating: number = 0;
  activeTab: string = 'details';
  showAllReviews: boolean = false;
  loggedInUserId: number | null = null;
  private inventorySubscription: Subscription | undefined;
  private spctSubscription: Subscription | undefined;
  private subscriptions: Subscription[] = [];

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
    this.loggedInUserId = this.tokenService.getUserId();
    this.setupWebSocket();
    this.loadProductDetail();
    this.loadVolumes();
    this.loadDanhGias();
  }

  ngOnDestroy(): void {
    if (this.inventorySubscription) {
      this.inventorySubscription.unsubscribe();
    }
    if (this.spctSubscription) {
      this.spctSubscription.unsubscribe();
    }
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.webSocketService.disconnect();
  }

  private setupWebSocket(): void {
    const userId = this.tokenService.getUserId();
    if (userId) {
      this.webSocketService.connect(userId);
    } else {
      console.warn('Không có userId để kết nối WebSocket');
    }

    this.spctSubscription = this.webSocketService.getSpctUpdates().subscribe({
      next: (update: any) => {
        // console.log('Nhận được cập nhật Spct:', update);
        this.updateSpctStatus(update);
      },
      error: (error) => console.error('Lỗi WebSocket trong ProductDetailComponent:', error),
    });

    this.inventorySubscription = this.webSocketService.getInventoryUpdates().subscribe({
      next: (update: { productId: number; stock: number }) => {
        // console.log('Nhận được cập nhật tồn kho:', update);
        this.updateStock(update.productId, update.stock);
      },
      error: (error) => console.error('Lỗi WebSocket trong ProductDetailComponent:', error),
    });
  }

  private updateSpctStatus(update: any): void {
    const idSpct = update.idSpct;
    const trangThai = update.trangThai;

    // console.log('Cập nhật Spct:', update);
    // console.log('Volumes trước cập nhật:', this.volumes);

    const volumeExists = this.volumes.some(volume => volume.idSpct === idSpct);

    if (!volumeExists) {
      // console.log(`idSpct ${idSpct} không có trong volumes, tải lại volumes...`);
      this.loadVolumes();
      return;
    }

    this.volumes = this.volumes.map(volume => {
      if (volume.idSpct === idSpct) {
        return { ...volume, trangThai: trangThai, dungTich: update.dungTich, donGia: update.donGia };
      }
      return volume;
    });

    // console.log('Volumes sau cập nhật:', this.volumes);

    this.activeVolumes = [...this.volumes.filter(volume => volume.trangThai === 1)];

    // console.log('Active Volumes sau cập nhật:', this.activeVolumes);

    if (this.selectedVolume && this.selectedVolume.idSpct === idSpct) {
      this.selectedVolume.trangThai = trangThai;
      this.product.trangThai = trangThai;

      if (trangThai === 0) {
        // console.log('Dung tích đang chọn bị ẩn, chuyển sang dung tích khác...');
        this.selectedVolume = this.activeVolumes.length > 0 ? this.activeVolumes[0] : null;
        if (this.selectedVolume) {
          // console.log('Chọn dung tích mới:', this.selectedVolume);
          this.product.dungTich = this.selectedVolume.dungTich;
          this.product.donGia = this.selectedVolume.donGia;
          this.product.idSpct = this.selectedVolume.idSpct;
          this.product.soLuongTonKho = this.selectedVolume.soLuongTonKho;
          this.product.trangThai = this.selectedVolume.trangThai;
        } else {
          // console.log('Không còn dung tích nào đang bán, đặt lại thông tin sản phẩm...');
          this.product.dungTich = null;
          this.product.donGia = null;
          this.product.idSpct = null;
          this.product.soLuongTonKho = null;
          this.product.trangThai = 0;
        }
      }
    }
  }

  private updateStock(productId: number, newStock: number): void {
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

    this.activeVolumes = this.activeVolumes.map(volume => {
      if (volume.idSpct === productId) {
        return { ...volume, soLuongTonKho: newStock };
      }
      return volume;
    });
  }

  loadProductDetail(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericProductId = parseInt(productId, 10);
      if (!isNaN(numericProductId)) {
        const sub = this.detailService.getProductDetailById(numericProductId).subscribe({
          next: (data: any) => {
            if (data && data.length > 0) {
              this.product = { ...data[0] };
              // console.log('Chi tiết sản phẩm:', data);
              if (this.product.imageURL) {
                this.imageUrls = this.product.imageURL.split(',').map((url: string) => url.trim());
              }
              this.loadRecommendedProducts();
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
        this.subscriptions.push(sub);
      }
    }
  }
  loadVolumes(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericProductId = parseInt(productId, 10);
      if (!isNaN(numericProductId)) {
        const sub = this.sanPhamService.getProductVolumes(numericProductId).subscribe({
          next: (volumes: any[]) => {
            this.volumes = volumes;
            this.activeVolumes = [...this.volumes];
            this.selectedVolume = this.activeVolumes.find(volume => volume.trangThai === 1) || null;
            if (this.selectedVolume) {
              this.product.dungTich = this.selectedVolume.dungTich;
              this.product.donGia = this.selectedVolume.donGia;
              this.product.idSpct = this.selectedVolume.idSpct;
              this.product.soLuongTonKho = this.selectedVolume.soLuongTonKho;
              this.product.trangThai = this.selectedVolume.trangThai;
            }
            this.loadInitialSpctStatuses();
          },
          error: (err) => console.error('Lỗi khi lấy danh sách dung tích:', err),
        });
        this.subscriptions.push(sub);
      }
    }
  }

  private loadInitialSpctStatuses(): void {
    const idSpcts = this.volumes.map(volume => volume.idSpct);
    if (idSpcts.length > 0) {
      const sub = this.sanPhamService.getMultipleProductStatuses(idSpcts).subscribe({
        next: (statusMap: { [key: number]: number }) => {
          this.volumes = this.volumes.map(volume => {
            const trangThai = statusMap[volume.idSpct] !== undefined ? statusMap[volume.idSpct] : 1;
            return { ...volume, trangThai };
          });

          this.activeVolumes = [...this.volumes];

          if (this.selectedVolume) {
            const selectedStatus = statusMap[this.selectedVolume.idSpct];
            this.selectedVolume.trangThai = selectedStatus !== undefined ? selectedStatus : 1;
            this.product.trangThai = this.selectedVolume.trangThai;

            if (this.selectedVolume.trangThai === 0) {
              this.selectedVolume = this.activeVolumes.find(volume => volume.trangThai === 1) || null;
              if (this.selectedVolume) {
                this.product.dungTich = this.selectedVolume.dungTich;
                this.product.donGia = this.selectedVolume.donGia;
                this.product.idSpct = this.selectedVolume.idSpct;
                this.product.soLuongTonKho = this.selectedVolume.soLuongTonKho;
                this.product.trangThai = this.selectedVolume.trangThai;
              } else {
                this.product.dungTich = null;
                this.product.donGia = null;
                this.product.idSpct = null;
                this.product.soLuongTonKho = null;
                this.product.trangThai = 0;
              }
            }
          } else {
            this.selectedVolume = this.activeVolumes.find(volume => volume.trangThai === 1) || null;
            if (this.selectedVolume) {
              this.product.dungTich = this.selectedVolume.dungTich;
              this.product.donGia = this.selectedVolume.donGia;
              this.product.idSpct = this.selectedVolume.idSpct;
              this.product.soLuongTonKho = this.selectedVolume.soLuongTonKho;
              this.product.trangThai = this.selectedVolume.trangThai;
            }
          }
        },
        error: (err) => console.error('Lỗi khi lấy trạng thái ban đầu của Spct:', err),
      });
      this.subscriptions.push(sub);
    }
  }

  loadRecommendedProducts(): void {
    if (this.product) {
      const sub = this.detailService.getRecommendedProducts1(this.product).subscribe({
        next: (data: any[]) => {
          this.recommendedProducts = data;
          // console.log('Sản phẩm gợi ý:', this.recommendedProducts);
        },
        error: (err) => console.error('Lỗi khi tải sản phẩm gợi ý:', err),
      });
      this.subscriptions.push(sub);
    }
  }

  loadDanhGias(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      const numericProductId = parseInt(productId, 10);
      if (!isNaN(numericProductId)) {
        const sub = this.danhGiaService.getDanhGiaBySanPham(numericProductId).subscribe({
          next: (res) => {
            this.danhGias = res;
            this.applyFilter();
            this.calculateAverageRating();
            this.updateDisplayedDanhGias();
          },
          error: (err) => console.error('Lỗi khi lấy danh sách đánh giá:', err),
        });
        this.subscriptions.push(sub);
      }
    }
  }


  starTypes: string[] = [];

  calculateAverageRating(): void {
    if (this.danhGias.length > 0) {
      const totalRating = this.danhGias.reduce((sum, dg) => sum + dg.rating, 0);
      this.averageRating = totalRating / this.danhGias.length;
    } else {
      this.averageRating = 0;
    }

    this.starTypes = [];
    for (let i = 1; i <= 5; i++) {
      if (this.averageRating >= i) {
        this.starTypes.push('full');
      } else if (this.averageRating >= i - 0.5) {
        this.starTypes.push('half');
      } else {
        this.starTypes.push('empty');
      }
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
    this.product.trangThai = volume.trangThai;
  }

  addToCart(): void {
    if (!this.validateProductSelection()) return;

    const productCopy = {
      ...this.product,
      dungTich: this.selectedVolume.dungTich,
      donGia: this.selectedVolume.donGia,
    };

    this.cartService.addToCart(productCopy, this.quantity);
    Swal.fire({
      icon: 'success',
      title: 'Thêm vào giỏ hàng thành công',
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 1500,
    });
    this.quantity = 1;
  }

  buyNow(): void {
    if (!this.validateProductSelection()) return;

    const productCopy = {
      ...this.product,
      dungTich: this.selectedVolume.dungTich,
      donGia: this.selectedVolume.donGia,
      idSpct: this.selectedVolume.idSpct,
      soLuongTonKho: this.selectedVolume.soLuongTonKho,
    };

    const cartItem: CartItemWithKey = {
      key: `buy-now-${productCopy.idSpct}`,
      product: productCopy,
      quantity: this.quantity,
      volume: this.selectedVolume.dungTich,
    };

    const currentSelectedItems = this.cartService.getSelectedCartItems();
    const updatedItems = [...currentSelectedItems, cartItem];
    this.cartService.setSelectedCartItems(updatedItems);

    this.router.navigate(['/app-order']);
    this.quantity = 1;
  }

  private validateProductSelection(): boolean {
    if (!this.selectedVolume) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn dung tích',
        text: 'Vui lòng chọn dung tích trước khi thêm vào giỏ hàng!',
        position: 'bottom-end',
      });
      return false;
    }

    if (!this.product || !this.product.idSanPham) {
      console.error('❌ Lỗi: Thông tin sản phẩm bị thiếu!', this.product);
      return false;
    }

    if (this.quantity > this.product.soLuongTonKho) {
      Swal.fire({
        icon: 'error',
        title: 'Số lượng vượt quá tồn kho',
        text: `Chỉ còn ${this.product.soLuongTonKho} sản phẩm!`,
        position: 'bottom-end',
      });
      return false;
    }

    if (this.quantity < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Số lượng không hợp lệ',
        text: 'Số lượng phải lớn hơn 0!',
        position: 'bottom-end',
      });
      this.quantity = 1;
      return false;
    }

    if (this.selectedVolume.trangThai === 0) {
      Swal.fire({
        icon: 'error',
        title: 'Sản phẩm không có sẵn',
        text: 'Dung tích này hiện không được bán!',
        position: 'bottom-end',
      });
      return false;
    }

    return true;
  }

  getFirstImage(product: any): string {
    if (product.imageURL) {
      const images = product.imageURL.split(',').map((url: string) => url.trim());
      return images[0] || 'https://via.placeholder.com/150';
    }
    return 'https://via.placeholder.com/150';
  }

  getFirstVolumePrice(product: any): number {
    if (product.volumes && product.volumes.length > 0) {
      return product.volumes[0].donGia;
    }
    return product.donGia || 0;
  }

  viewRelatedProduct(relatedProduct: any): void {
    this.updateProductDetails(relatedProduct);
    const productId = relatedProduct.idSanPham;
    this.router.navigate(['/product/detail', productId], { replaceUrl: true });
    this.loadDanhGias();
    this.loadVolumes();
    this.loadRecommendedProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  updateProductDetails(product: any): void {
    this.product = { ...product };
    if (product.imageURL) {
      this.imageUrls = product.imageURL.split(',').map((url: string) => url.trim());
    }
    this.volumes = product.volumes?.length
      ? product.volumes
      : [{
          idSpct: product.idSpct,
          dungTich: product.dungTich,
          donGia: product.donGia,
          soLuongTonKho: product.soLuongTonKho,
        }];
    this.activeVolumes = this.volumes.filter(volume => volume.trangThai === 1);
    this.selectedVolume = this.activeVolumes.length > 0 ? this.activeVolumes[0] : null;
    this.selectedImageIndex = 0;
    this.quantity = 1;
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

      const sub = this.danhGiaService.addDanhGia(reviewData).subscribe({
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
      this.subscriptions.push(sub);
    }
  }

  filterByStars(stars: number | null): void {
    this.selectedStarFilter = stars;
    this.applyFilter();
    this.updateDisplayedDanhGias();
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

  updateDisplayedDanhGias(): void {
    if (this.showAllReviews) {
      this.displayedDanhGias = [...this.filteredDanhGias];
    } else {
      this.displayedDanhGias = this.filteredDanhGias.slice(0, 2);
    }
  }

  toggleShowAllReviews(): void {
    this.showAllReviews = !this.showAllReviews;
    this.updateDisplayedDanhGias();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // console.log('Tab hiện tại:', this.activeTab);
  }

  increaseQuantity(): void {
    if (this.quantity < this.product.soLuongTonKho) {
      this.quantity++;
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Số lượng vượt quá tồn kho',
        text: `Chỉ còn ${this.product.soLuongTonKho} sản phẩm!`,
        position: 'bottom-end',
      });
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Số lượng không hợp lệ',
        text: 'Số lượng phải lớn hơn 0!',
        position: 'bottom-end',
      });
    }
  }

  isOwnReview(danhGia: any): boolean {
    return this.loggedInUserId !== null && danhGia.idTaiKhoan === this.loggedInUserId;
  }

  setRatingForEdit(danhGia: any, rating: number): void {
    danhGia.newRating = rating;
  }

  editDanhGia(danhGia: any): void {
    if (!danhGia.newRating || danhGia.newRating < 1 || danhGia.newRating > 5) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa chọn số sao',
        text: 'Vui lòng chọn số sao để đánh giá!',
        position: 'bottom-end',
      });
      return;
    }

    if (!danhGia.newComment || !danhGia.newComment.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Chưa nhập bình luận',
        text: 'Vui lòng nhập bình luận để cập nhật đánh giá!',
        position: 'bottom-end',
      });
      return;
    }

    const danhGiaDTO = {
      id: danhGia.id,
      idSanPham: danhGia.idSanPham,
      idTaiKhoan: danhGia.idTaiKhoan,
      idDonHang: danhGia.idDonHang || null,
      rating: danhGia.newRating,
      comment: danhGia.newComment,
    };

    const sub = this.danhGiaService.updateDanhGia(danhGia.id, danhGiaDTO).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Cập nhật thành công',
          text: 'Đánh giá của bạn đã được cập nhật!',
          position: 'bottom-end',
          timer: 1500,
        });
        danhGia.isEditing = false;
        this.loadDanhGias();
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật đánh giá:', err);
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: 'Không thể cập nhật đánh giá. Vui lòng thử lại!',
          position: 'bottom-end',
        });
      },
    });
    this.subscriptions.push(sub);
  }

  deleteDanhGia(danhGiaId: number): void {
    Swal.fire({
      title: 'Xác nhận xóa',
      text: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        const sub = this.danhGiaService.deleteDanhGia(danhGiaId, this.loggedInUserId!).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Xóa thành công',
              text: 'Đánh giá đã được xóa!',
              position: 'bottom-end',
              timer: 1500,
            });
            this.loadDanhGias();
          },
          error: (err) => {
            console.error('Lỗi khi xóa đánh giá:', err);
            Swal.fire({
              icon: 'error',
              title: 'Lỗi',
              text: 'Không thể xóa đánh giá. Vui lòng thử lại!',
              position: 'bottom-end',
            });
          },
        });
        this.subscriptions.push(sub);
      }
    });
  }
}
