import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DefectiveProduct {
  idYeuCau: number;
  idSpct: number;
  tenSanPham: string;
  soLuong: number;
  tinhTrangHang: string;
  lyDoTraHang: string;
  tenThuongHieu: string;
  idThuongHieu: number;
  imageUrl?: string;
  donGia?: number;
  dungTich?: number;
  selected?: boolean;
}

interface CartItem extends DefectiveProduct {
  cartQuantity: number;
}

interface Page<T> {
  content: T[];
  pageable: {
    sort: any;
    offset: number;
    pageNumber: number;
    pageSize: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: any;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Component({
  selector: 'app-tra-hang-nha-san-xuat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tra-hang-nha-san-xuat.component.html',
  styleUrls: ['./tra-hang-nha-san-xuat.component.scss']
})
export class TraHangNhaSanXuatComponent implements OnInit {
  defectiveProducts: DefectiveProduct[] = [];
  cart: CartItem[] = [];
  sendForm = {
    ghiChu: '',
    trangThaiGui: 0
  };
  selectedBrand: string | null = null;
  filterBrand: string | null = null;
  allBrands: string[] = [];
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  page: number = 0;
  size: number = 16;
  totalPages: number = 1;
  totalElements: number = 0;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadAllBrands();
    this.loadDefectiveProducts();
  }

  loadAllBrands(): void {
    this.http.get<Page<DefectiveProduct>>(`http://localhost:8080/api/tra-hang/defective-products`, {
      params: new HttpParams().set('page', '0').set('size', '1000')
    }).subscribe({
      next: (data) => {
        this.allBrands = [...new Set(data.content.map(product => product.tenThuongHieu))];
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách thương hiệu:', err);
      }
    });
  }

  loadDefectiveProducts(page: number = this.page, size: number = this.size): void {
    page = page ?? 0;
    size = size ?? 16;

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (this.filterBrand) {
      params = params.set('brand', this.filterBrand);
    }

    this.isLoading = true;
    this.defectiveProducts = [];

    this.http.get<Page<DefectiveProduct>>(`http://localhost:8080/api/tra-hang/defective-products`, { params }).subscribe({
      next: (data) => {
        this.defectiveProducts = data.content.map(product => ({
          ...product,
          selected: this.cart.some(item => item.idSpct === product.idSpct && item.idYeuCau === product.idYeuCau)
        }));
        this.page = data.number ?? 0;
        this.size = data.size ?? 16;
        this.totalPages = data.totalPages ?? 1;
        this.totalElements = data.totalElements ?? 0;
        this.isLoading = false;

      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'Lỗi khi tải danh sách sản phẩm lỗi: ' + err.message;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  onFilterBrandChange(): void {
    this.page = 0;
    this.selectedBrand = this.filterBrand || null;
    if (this.filterBrand) {
      this.cart = this.cart.filter(item => item.tenThuongHieu === this.filterBrand);
      this.updateSelectedBrand();
    }
    this.loadDefectiveProducts();
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      this.page = p;
    
      this.loadDefectiveProducts();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
     
      this.loadDefectiveProducts();
    }
  }

  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
     
      this.loadDefectiveProducts();
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

  private updateSelectedBrand(): void {
    if (this.cart.length > 0) {
      this.selectedBrand = this.cart[0].tenThuongHieu;
    } else {
      this.selectedBrand = this.filterBrand || null;
    }
  }

  onCheckboxChange(product: DefectiveProduct): void {
    if (product.selected) {
      this.addToCart(product);
    } else {
      this.cart = this.cart.filter(item => item.idSpct !== product.idSpct || item.idYeuCau !== product.idYeuCau);
      this.updateSelectedBrand();
      this.cdr.detectChanges();
    }
  }

  addToCart(product: DefectiveProduct): void {
    if (this.filterBrand && product.tenThuongHieu !== this.filterBrand) {
      this.errorMessage = `Chỉ được thêm sản phẩm của thương hiệu ${this.filterBrand} khi đang lọc.`;
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: this.errorMessage,
        confirmButtonText: 'Đóng'
      });
      product.selected = false;
      this.cdr.detectChanges();
      return;
    }

    if (this.cart.length > 0) {
      const firstBrandInCart = this.cart[0].tenThuongHieu;
      product.selected = false;
      if (product.tenThuongHieu !== firstBrandInCart) {
        this.errorMessage = `Giỏ hàng chỉ được chứa sản phẩm của một thương hiệu. Hiện tại giỏ hàng đang chứa sản phẩm của thương hiệu ${firstBrandInCart}.`;
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo',
          text: this.errorMessage,
          confirmButtonText: 'Đóng'
        });
        this.cdr.detectChanges();
        return;
      }
    }

    const existingItem = this.cart.find(item => item.idSpct === product.idSpct && item.idYeuCau === product.idYeuCau);
    if (existingItem) {
      if (existingItem.cartQuantity < product.soLuong) {
        existingItem.cartQuantity += 1;
      } else {
        this.errorMessage = `Số lượng tối đa cho ${product.tenSanPham} đã đạt.`;
        Swal.fire({
          icon: 'warning',
          title: 'Cảnh báo',
          text: this.errorMessage,
          confirmButtonText: 'Đóng'
        });
        product.selected = false;
        this.cdr.detectChanges();
        return;
      }
    } else {
      this.cart.push({ ...product, cartQuantity: 1 });
    }

    const defectiveProduct = this.defectiveProducts.find(
      p => p.idSpct === product.idSpct && p.idYeuCau === product.idYeuCau
    );
    if (defectiveProduct) {
      defectiveProduct.selected = true;
    }

    this.updateSelectedBrand();
    this.cdr.detectChanges();
  }

  removeFromCart(item: CartItem): void {
    this.cart = this.cart.filter(cartItem => cartItem.idSpct !== item.idSpct || cartItem.idYeuCau !== item.idYeuCau);

    const defectiveProduct = this.defectiveProducts.find(
      p => p.idSpct === item.idSpct && p.idYeuCau === item.idYeuCau
    );
    if (defectiveProduct) {
      defectiveProduct.selected = false;
    }

    this.updateSelectedBrand();
    this.cdr.detectChanges();
  }

  updateCartQuantity(item: CartItem, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(item);
    } else if (quantity <= item.soLuong) {
      item.cartQuantity = quantity;
    } else {
      item.cartQuantity = item.soLuong;
      this.errorMessage = `Số lượng tối đa cho ${item.tenSanPham} là ${item.soLuong}.`;
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: this.errorMessage,
        confirmButtonText: 'Đóng'
      });
    }
    this.cdr.detectChanges();
  }

  getBrandsInCart(): string[] {
    if (this.filterBrand) {
      return [this.filterBrand];
    }
    return [...new Set(this.cart.map(item => item.tenThuongHieu))];
  }

  private generatePDF(): void {
    if (!this.selectedBrand || this.cart.length === 0) {
      console.warn('Không thể tạo PDF: Chưa chọn thương hiệu hoặc giỏ hàng trống.');
      return;
    }

    const itemsToPrint = this.cart.filter(item => item.tenThuongHieu === this.selectedBrand);
    if (itemsToPrint.length === 0) {
      console.warn(`Không có sản phẩm nào của thương hiệu ${this.selectedBrand} trong giỏ hàng.`);
      return;
    }

    // Format ngày giờ gửi
    const sendDateTime = new Date().toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Tạo nội dung HTML tạm thời để render vào PDF
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2 style="text-align: center;">Danh Sách Sản Phẩm Hỏng</h2>
        <h4>Thương hiệu: ${this.selectedBrand}</h4>
        <p>Ngày giờ gửi: ${sendDateTime}</p>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="border: 1px solid #ddd; padding: 8px;">Tên Sản Phẩm</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Số Lượng</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Dung Tích</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Tình Trạng Hàng</th>
              <th style="border: 1px solid #ddd; padding: 8px;">Lý Do Trả Hàng</th>
            </tr>
          </thead>
          <tbody>
            ${itemsToPrint
              .map(
                item => `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.tenSanPham}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.cartQuantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.dungTich}ml</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.tinhTrangHang}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${item.lyDoTraHang}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
        <div style="margin-top: 40px; display: flex; justify-content: space-between;">
          <div>
            <p>Người Nhận</p>
            <p>__________________________</p>
          </div>
        </div>
      </div>
    `;

    // Tạo một div tạm để render nội dung
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = printContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    // Sử dụng html2canvas để chụp nội dung
    html2canvas(tempDiv, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`DanhSachSanPhamHong_${this.selectedBrand}_${new Date().toISOString().slice(0, 10)}.pdf`);

      // Xóa div tạm
      document.body.removeChild(tempDiv);
    });
  }

  sendToManufacturer(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (!this.selectedBrand) {
      this.errorMessage = 'Vui lòng chọn một thương hiệu để gửi.';
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: this.errorMessage,
        confirmButtonText: 'Đóng'
      });
      return;
    }

    const itemsToSend = this.cart.filter(item => item.tenThuongHieu === this.selectedBrand);
    if (itemsToSend.length === 0) {
      this.errorMessage = `Không có sản phẩm nào của thương hiệu ${this.selectedBrand} trong giỏ hàng.`;
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: this.errorMessage,
        confirmButtonText: 'Đóng'
      });
      return;
    }

    const requests = itemsToSend.map(item => ({
      idYeuCau: item.idYeuCau,
      idSpct: item.idSpct,
      soLuongGui: item.cartQuantity,
      idThuongHieu: item.idThuongHieu,
      ghiChu: this.sendForm.ghiChu
    }));

    this.isLoading = true;
    Swal.fire({
      title: 'Đang gửi...',
      text: 'Vui lòng đợi trong khi yêu cầu được xử lý.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post<any>(`http://localhost:8080/api/tra-hang/send-to-manufacturer`, requests).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = typeof response === 'string'
          ? response
          : (response?.message || 'Gửi yêu cầu trả hàng thành công!');
        Swal.fire({
          icon: 'success',
          title: 'Thành công',
          text: this.successMessage,
          confirmButtonText: 'Đóng'
        });

        // Tạo và tải PDF tự động sau khi gửi thành công
        this.generatePDF();

        // Reset giỏ hàng và trạng thái
        this.cart = this.cart.filter(item => item.tenThuongHieu !== this.selectedBrand);
        this.selectedBrand = null;
        this.sendForm.ghiChu = '';
        this.loadDefectiveProducts();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Lỗi từ backend:', err);
        const errorMessage = err.error && typeof err.error === 'object' ? JSON.stringify(err.error) : (err.error || err.message);
        this.errorMessage = 'Lỗi khi gửi sản phẩm: ' + errorMessage;
        Swal.fire({
          icon: 'error',
          title: 'Lỗi',
          text: this.errorMessage,
          confirmButtonText: 'Đóng'
        });
      }
    });
  }

  resetCart(): void {
    this.cart = [];
    this.selectedBrand = null;
    this.sendForm.ghiChu = '';
    this.defectiveProducts.forEach(product => (product.selected = false));
    this.cdr.detectChanges();
  }
}