import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AddProductComponent } from '../add-product/add-product.component';
import { UpdateProductComponent } from '../update-product/update-product.component';
import { SpctComponent } from '../product-detail/spct-list/spct.component';
import { SanPhamService } from '../../../service/product.service';
import { SpctService } from '../../../service/spct.service';
import { TokenService } from '../../../service/token.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-product-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, SpctComponent],
  templateUrl: './product-admin.component.html',
  styleUrls: ['./product-admin.component.scss'],
  providers: [NgbActiveModal]
})
export class ProductAdminComponent implements OnInit {
  userRole: string | null = null;
  products: any[] = [];
  searchTerm: string = '';
  page: number = 0;
  size: number = 15;
  totalPages: number = 0;
  selectedProductId: number | null = null;
  selectedProduct: any = null;

  constructor(
    private sanPhamService: SanPhamService,
    private spctService: SpctService,
    private router: Router,
    private modalService: NgbModal,
    private tokenService: TokenService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.userRole = this.tokenService.getRole();
    console.log('Vai trò trong ProductAdminComponent:', this.userRole);
    this.loadProducts();
  }

  getNotesString(notes: any[]): string {
    if (!notes || !Array.isArray(notes)) return 'Không xác định';
    return notes.map(note => note.tenNotHuong).join(', ') || 'Không xác định';
  }

  getPhongCachString(phongCach: any[]): string {
    if (!phongCach || !Array.isArray(phongCach)) return 'Không có phong cách';
    return phongCach.map(style => style.tenPhongCach).join(', ');
  }

  loadProducts(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('📌 Gọi API với:', this.page, this.size);
      this.sanPhamService.getSanPhamDetailonAdmin(this.searchTerm, this.page, this.size).subscribe({
        next: (response) => {
          this.products = (response.content || []).map((product: any) => ({
            ...product,
            huongDauString: this.getNotesString(product.huongDau),
            huongGiuaString: this.getNotesString(product.huongGiua),
            huongCuoiString: this.getNotesString(product.huongCuoi),
            phongCachString: this.getPhongCachString(product.phongCach)
          }));
          this.totalPages = response.page?.totalPages || 1;
          console.log('✅ Sản phẩm response:', response);
          resolve();
        },
        error: (error) => {
          console.error('❌ Lỗi khi lấy dữ liệu sản phẩm:', error);
          this.toastr.error('Không thể tải danh sách sản phẩm.', 'Lỗi');
          reject(error);
        }
      });
    });
  }

  openAddModal(): void {
    const modalRef = this.modalService.open(AddProductComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });

    modalRef.componentInstance.productAdd.subscribe((newProduct: any) => {
      console.log('Sản phẩm mới:', newProduct);
      newProduct.isNew = true; // Mark as new product
      this.loadProducts().then(() => {
        if (newProduct && newProduct.idSanPham) {
          this.viewProductDetails(newProduct);
        }
      });
    });

    modalRef.result
      .then(
        (result) => {
          console.log('Modal đóng với kết quả:', result);
          this.restorePageState();
        },
        (reason) => {
          console.log('Modal bị hủy với lý do:', reason);
          this.restorePageState();
        }
      )
      .catch((error) => {
        console.error('Lỗi khi đóng modal:', error);
        this.restorePageState();
      });
  }

  openUpdateProductModal(productId: number): void {
    const modalRef = this.modalService.open(UpdateProductComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false,
    });
    modalRef.componentInstance.productId = productId;

    modalRef.componentInstance.productUpdate.subscribe((updatedProduct: any) => {
      console.log('Sản phẩm cập nhật:', updatedProduct);
      this.loadProducts();
    });

    modalRef.result
      .then(
        (result) => {
          console.log('Modal đóng với kết quả:', result);
          this.restorePageState();
        },
        (reason) => {
          console.log('Modal bị hủy với lý do:', reason);
          this.restorePageState();
        }
      )
      .catch((error) => {
        console.error('Lỗi khi đóng modal:', error);
        this.restorePageState();
      });
  }

  toggleProductStatus(id: number, currentTrangThai: number): void {
    const action = currentTrangThai === 1 ? 'ngưng bán' : 'tiếp tục bán';
    const confirmed = window.confirm(`Bạn có chắc muốn ${action} sản phẩm này không?`);
    if (confirmed) {
      const newTrangThai = currentTrangThai === 1 ? 0 : 1;
      this.sanPhamService.updateSanPhamTrangThai(id, newTrangThai).subscribe({
        next: (response) => {
          console.log('✅ Cập nhật trạng thái SanPham:', response);
          this.loadProducts();
          this.toastr.success(`Đã ${action} sản phẩm.`, 'Thành công');
        },
        error: (error) => {
          console.error('❌ Lỗi khi cập nhật trạng thái:', error);
          this.toastr.error('Cập nhật trạng thái thất bại.', 'Lỗi');
        }
      });
    }
  }

  viewProductDetails(product: any): void {
    this.selectedProductId = product.idSanPham;
    this.selectedProduct = product;
    console.log(`🔎 Đang xem chi tiết sản phẩm ID: ${this.selectedProductId}`);
    this.cdr.detectChanges();
  }

  closeProductDetail(): void {
    this.selectedProductId = null;
    this.selectedProduct = null;
    console.log('🔄 Đã đóng chi tiết sản phẩm.');
    this.restorePageState();
  }

  private restorePageState(): void {
    console.log('🔄 Khôi phục trạng thái trang...');
    document.body.classList.remove('modal-open');
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      console.log('🗑️ Xóa backdrop:', backdrop);
      backdrop.remove();
    });
    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      console.log('🗑️ Xóa modal:', modal);
      modal.classList.remove('show');
      modal.remove();
    });
    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';
    this.cdr.detectChanges();
    console.log('✅ Đã khôi phục trạng thái trang');
  }

  onSearch(): void {
    console.log('Tìm kiếm với từ khóa:', this.searchTerm);
    this.page = 0;
    this.loadProducts();
  }

  goToPage(p: number): void {
    if (p >= 0 && p < this.totalPages && p !== this.page) {
      console.log('🔄 Chuyển đến trang:', p);
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

  getPaginationRange(): { page: number, isEllipsis: boolean }[] {
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

  async exportToExcel(): Promise<void> {
    const exportData: any[] = [];
    let index = 0;
    let allProducts: any[] = [];

    try {
      const firstResponse = await this.sanPhamService.getSanPhamDetailonAdmin('', 0, 100).toPromise();
      const totalPages = firstResponse.page?.totalPages || 1;
      allProducts = (firstResponse.content || []).map((product: any) => ({
        ...product,
        huongDauString: this.getNotesString(product.huongDau),
        huongGiuaString: this.getNotesString(product.huongGiua),
        huongCuoiString: this.getNotesString(product.huongCuoi),
        phongCachString: this.getPhongCachString(product.phongCach)
      }));

      if (totalPages > 1) {
        for (let page = 1; page < totalPages; page++) {
          const response = await this.sanPhamService.getSanPhamDetailonAdmin('', page, 100).toPromise();
          const pageProducts = (response.content || []).map((product: any) => ({
            ...product,
            huongDauString: this.getNotesString(product.huongDau),
            huongGiuaString: this.getNotesString(product.huongGiua),
            huongCuoiString: this.getNotesString(product.huongCuoi),
            phongCachString: this.getPhongCachString(product.phongCach)
          }));
          allProducts = allProducts.concat(pageProducts);
        }
      }

      for (const product of allProducts) {
        try {
          const spctResponse = await this.spctService.geSpctByIdProduct(product.idSanPham).toPromise();
          const spctList = spctResponse?.content || spctResponse || [];

          if (spctList.length === 0) {
            exportData.push({
              'STT': ++index,
              'Tên Sản Phẩm': product.tenSanPham || 'Không xác định',
              'Thương Hiệu': product.tenThuongHieu || 'Không xác định',
              'Danh Mục': product.tenDanhMuc || 'Không xác định',
              'Tồn Kho': product.tongSoLuong || 0,
              'Trạng Thái': product.trangThai === 1 ? 'Đang bán' : 'Ngưng bán',
              'Hương Đầu': product.huongDauString || 'Không xác định',
              'Hương Giữa': product.huongGiuaString || 'Không xác định',
              'Hương Cuối': product.huongCuoiString || 'Không xác định',
              'Phong Cách': product.phongCachString || 'Không có phong cách',
              'Giá': 'Không có giá',
              'Số Lượng': 'Không có số lượng',
              'Dung Tích': 'Không có dung tích'
            });
          } else {
            for (const spct of spctList) {
              exportData.push({
                'STT': ++index,
                'Tên Sản Phẩm': product.tenSanPham || 'Không xác định',
                'Thương Hiệu': product.tenThuongHieu || 'Không xác định',
                'Danh Mục': product.tenDanhMuc || 'Không xác định',
                'Tồn Kho': product.tongSoLuong || 0,
                'Trạng Thái': product.trangThai === 1 ? 'Đang bán' : 'Ngưng bán',
                'Hương Đầu': product.huongDauString || 'Không xác định',
                'Hương Giữa': product.huongGiuaString || 'Không xác định',
                'Hương Cuối': product.huongCuoiString || 'Không xác định',
                'Phong Cách': product.phongCachString || 'Không có phong cách',
                'Giá': spct.donGia ? spct.donGia.toLocaleString('vi-VN') + ' VND' : 'N/A',
                'Số Lượng': spct.soLuongTonKho || 'N/A',
                'Dung Tích': spct.dungTich ? spct.dungTich + ' ml' : 'N/A'
              });
            }
          }
        } catch (error) {
          console.error(`❌ Lỗi khi lấy SPCT cho sản phẩm ${product.idSanPham}:`, error);
          exportData.push({
            'STT': ++index,
            'Tên Sản Phẩm': product.tenSanPham || 'Không xác định',
            'Thương Hiệu': product.tenThuongHieu || 'Không xác định',
            'Danh Mục': product.tenDanhMuc || 'Không xác định',
            'Tồn Kho': product.tongSoLuong || 0,
            'Trạng Thái': product.trangThai === 1 ? 'Đang bán' : 'Ngưng bán',
            'Hương Đầu': product.huongDauString || 'Không xác định',
            'Hương Giữa': product.huongGiuaString || 'Không xác định',
            'Hương Cuối': product.huongCuoiString || 'Không xác định',
            'Phong Cách': product.phongCachString || 'Không có phong cách',
            'Giá': 'Không có giá',
            'Số Lượng': 'Không có số lượng',
            'Dung Tích': 'Không có dung tích'
          });
        }
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh Sách Sản Phẩm');

      const colWidths = exportData.reduce((widths, row) => {
        Object.keys(row).forEach((key, i) => {
          const value = row[key] ? row[key].toString() : '';
          widths[i] = Math.max(widths[i] || 10, Math.min(value.length, 50));
        });
        return widths;
      }, []);
      worksheet['!cols'] = colWidths.map(w => ({ wch: w }));

      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = worksheet[XLSX.utils.encode_cell({ r: 0, c: C })];
        if (cell) {
          cell.s = {
            font: { bold: true },
            alignment: { horizontal: 'center' },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' }
            }
          };
        }
      }

      XLSX.writeFile(workbook, 'Danh_Sach_San_Pham.xlsx');
      this.toastr.success('Xuất file Excel thành công!', 'Thành công');
    } catch (error) {
      console.error('❌ Lỗi khi xuất Excel:', error);
      this.toastr.error('Xuất file Excel thất bại.', 'Lỗi');
    }
  }
}
