import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit, Input } from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators,FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { firstValueFrom } from 'rxjs';
import { DanhMucService } from '../../../service/danhmuc.service';
import { HuongCuoiService } from '../../../service/huongcuoi.service';
import { HuongDauService } from '../../../service/huongdau.service';
import { HuongGiuaService } from '../../../service/huonggiua.service';
import { SanPhamService } from '../../../service/product.service';
import { ThuongHieuService } from '../../../service/thuonghieu.service';
@Component({
  selector: 'app-update-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule
    , FormsModule],
  providers: [NgbActiveModal],
  templateUrl: './update-product.component.html',
  styleUrl: './update-product.component.scss'
})
export class UpdateProductComponent implements OnInit{
  @Input() productId!: number;
@Output() productUpdate = new EventEmitter<any>();
productForm: FormGroup;
selectedFiles: File[] = [];
previewUrls: string[] = [];         // Ảnh mới chọn
oldImageUrls: string[] = [];        // Ảnh cũ
oldImageIds: number[] = [];
deletedImageIds: number[] = [];
danhMucList: any[] = [];
thuongHieuList: any[] = [];
  constructor(
    private fb: FormBuilder,
    private danhMucService: DanhMucService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private sanphamService:SanPhamService,
    private thuonghieuService:ThuongHieuService,
    private huondauService:HuongDauService,
    private huonggiuaService:HuongGiuaService,
    private huongcuoiService:HuongCuoiService,
  ) {
    this.productForm = this.fb.group({
      ten: ['', [Validators.required, Validators.minLength(3)]],
      moTa: ['', [Validators.maxLength(1000)]],
      idThuongHieu: ['', Validators.required],
      idDanhMuc: ['', Validators.required],
      huongDau: ['', [Validators.required, Validators.minLength(2)]],
      huongGiua: ['', [Validators.required, Validators.minLength(2)]],
      huongCuoi: ['', [Validators.required, Validators.minLength(2)]]
    });
  }
  async ngOnInit() {
    if (!this.productId) return;

    this.getAllDanhMuc();
    this.getAllThuongHieu();

    try {
      const productResp = await firstValueFrom(this.sanphamService.getSanPhamById(this.productId));
      const imageResp = await firstValueFrom(this.sanphamService.getImagesByProductId(this.productId));

      this.productForm.patchValue({
        ten: productResp.tenSanPham,
        moTa: productResp.moTaSanPham,
        idThuongHieu: productResp.thuongHieu?.id,
        idDanhMuc: productResp.danhMuc?.id,
        huongDau: productResp.huongDau?.motaHuongDau,
        huongGiua: productResp.huongGiua?.moTaHuongGiua,
        huongCuoi: productResp.huongCuoi?.moTaHuongCuoi
      });

      this.oldImageUrls = imageResp.map((img: any) => img.link);
      this.oldImageIds = imageResp.map((img: any) => img.id);
    } catch (err) {
      console.error('❌ Lỗi khi load sản phẩm:', err);
    }
  }


  closeModal() {
    console.log('🛑 Attempting to close modal...', this.activeModal);

    // 🟢 Gọi dismiss() trước
    if (this.activeModal) {
        this.activeModal.dismiss('cancel');
        console.log('✅ Dismiss method called');
    } else {
        console.error('❌ ActiveModal is not available');
    }

    // 🟠 Backup plan: Xóa modal bằng Bootstrap
    setTimeout(() => {
        const modalElement = document.querySelector('.modal');
        if (modalElement) {
            modalElement.remove();
        }
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        document.body.classList.remove('modal-open');
        console.log('✅ Forced modal removal executed');

        // 🔥 Kích hoạt Change Detection để cập nhật UI
        this.cdr.detectChanges();
    }, 100);
}
onFileChange(event: any) {
  const file = event.target.files[0];
  if (file) {
    this.selectedFiles.push(file);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrls.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }
  event.target.value = '';
}

removeFile(index: number) {
  this.selectedFiles.splice(index, 1);
  this.previewUrls.splice(index, 1);
}
removeOldImage(index: number) {
  const idToRemove = this.oldImageIds[index];
  if (idToRemove) {
    this.deletedImageIds.push(idToRemove);
    this.oldImageIds.splice(index, 1);
    this.oldImageUrls.splice(index, 1);
  }
}

async updateProduct() {
  if (this.productForm.invalid || !this.productId) {
    this.productForm.markAllAsTouched();
    return;
  }

  const formValues = this.productForm.value;
  const formData = new FormData();

  const addHuong = async (
    service: any,
    moTaField: string,
    moTaValue: string | null
  ): Promise<number | null> => {
    if (!moTaValue) return null;
    const body = { [moTaField]: moTaValue };
    try {
      const response: any = await firstValueFrom(service.add(body));
      return response?.id || null;
    } catch (error) {
      console.error(`❌ Lỗi thêm ${moTaField}:`, error);
      return null;
    }
  };

  try {
    const [idHuongDau, idHuongGiua, idHuongCuoi] = await Promise.all([
      addHuong(this.huondauService, 'motaHuongDau', formValues.huongDau),
      addHuong(this.huonggiuaService, 'moTaHuongGiua', formValues.huongGiua),
      addHuong(this.huongcuoiService, 'moTaHuongCuoi', formValues.huongCuoi),
    ]);

    formData.append('idSanPham', String(this.productId));
    formData.append('ten', formValues.ten || '');
    formData.append('moTa', formValues.moTa || '');
    formData.append('idThuongHieu', String(formValues.idThuongHieu));
    formData.append('idDanhMuc', String(formValues.idDanhMuc));
    formData.append('idHuongDau', String(idHuongDau || ''));
    formData.append('idHuongGiua', String(idHuongGiua || ''));
    formData.append('idHuongCuoi', String(idHuongCuoi || ''));

    this.selectedFiles.forEach(file => formData.append('image', file));
    this.deletedImageIds.forEach(id => formData.append('idHinhAnhDelete', String(id)));
    console.log('📤 FormData gửi đi:');
    console.log('➡️ idSanPham:', this.productId);
    console.log('➡️ Tên:', formValues.ten);
    console.log('➡️ Mô tả:', formValues.moTa);
    console.log('➡️ Danh mục ID:', formValues.idDanhMuc);
    console.log('➡️ Thương hiệu ID:', formValues.idThuongHieu);
    console.log('➡️ ID Hương Đầu:', idHuongDau);
    console.log('➡️ ID Hương Giữa:', idHuongGiua);
    console.log('➡️ ID Hương Cuối:', idHuongCuoi);
    console.log('🖼 Ảnh mới:', this.selectedFiles);
    console.log('❌ ID ảnh cần xoá:', this.deletedImageIds);

    // // Log rõ hơn về FormData gửi đi (dùng debug hoặc inspect kỹ):
    // for (let pair of formData.entries()) {
    //   console.log(`${pair[0]} ➡️`, pair[1]);
    // }

    const response = await firstValueFrom(this.sanphamService.updateSanPham(formData));
    alert('✅ Cập nhật thành công!');
    this.productUpdate.emit(response);
    this.closeModal();
  } catch (err) {
    console.error('❌ Cập nhật thất bại:', err);
    alert('❌ Lỗi khi cập nhật sản phẩm!');
  }
}
getAllThuongHieu() {
  this.thuonghieuService.getThuonghieu().subscribe({
    next: (data) => {
      this.thuongHieuList = data;
    },
    error: (err) => {
      console.error('❌ Lỗi lấy thương hiệu:', err);
    }
  });
}
getAllDanhMuc() {
  this.danhMucService.getAllDanhMucDanhMuc().subscribe({
    next: (data) => {
      this.danhMucList = data;
    },
    error: (err) => {
      console.error('❌ Lỗi lấy danh mục:', err);
    }
  });
}

}
