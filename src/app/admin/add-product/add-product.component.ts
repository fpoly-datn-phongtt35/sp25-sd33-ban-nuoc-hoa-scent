import { DanhMucService } from './../../service/danhmuc.service';
import { Component, EventEmitter, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators,FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {SanPhamService} from '../../service/product.service';
import{ThuongHieuService} from './../../service/thuonghieu.service';
import{HuongDauService} from './../../service/huongdau.service';
import{HuongGiuaService} from './../../service/huonggiua.service';
import{HuongCuoiService} from './../../service/huongcuoi.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule
    , FormsModule],
  providers: [NgbActiveModal],
  templateUrl: './add-product.component.html',
  styleUrl: './add-product.component.scss'
})
export class AddProductComponent implements OnInit{
  @Output() productAdd = new EventEmitter<any>();
  productForm: FormGroup;
  selectedFiles: File[] = [];
  danhMucList: any[] = [];
  thuongHieuList: any[]=[];
    previewUrls: string[] = [];
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


  }ngOnInit() {
    this.getAllDanhMuc();
    this.getAllThuongHieu();
    this.productForm.get('idThuongHieu')?.valueChanges.subscribe((val) => {
      if (val === '-1') {
        this.handleAddThuongHieu();
      }
    });

  }
  async handleAddThuongHieu() {
    const tenThuongHieu = prompt('📝 Nhập tên thương hiệu mới:');
    if (!tenThuongHieu || tenThuongHieu.trim().length < 2) {
      alert('⚠️ Tên thương hiệu không hợp lệ!');
      this.productForm.get('idThuongHieu')?.setValue('');
      return;
    }

    const quocGia = prompt('🌍 Nhập quốc gia của thương hiệu:') || '';
    const moTa = prompt('📄 Nhập mô tả cho thương hiệu (nếu có):') || '';

    const body = {
      tenThuongHieu: tenThuongHieu.trim(),
      quocGia: quocGia.trim(),
      moTa: moTa.trim()
    };

    try {
      const response = await firstValueFrom(this.thuonghieuService.addThuongHieu(body));
      alert('✅ Đã thêm thương hiệu mới!');
      await this.getAllThuongHieu(); // Làm mới danh sách
      this.productForm.get('idThuongHieu')?.setValue(response.id); // Gán thương hiệu vừa tạo
    } catch (err) {
      console.error('❌ Lỗi khi thêm thương hiệu:', err);
      alert('❌ Không thể thêm thương hiệu mới. Vui lòng thử lại!');
      this.productForm.get('idThuongHieu')?.setValue('');
    }
  }

    getAllDanhMuc(){
      this.danhMucService.getAllDanhMucDanhMuc().subscribe({
        next: (data) => {
          this.danhMucList = data;
        },
        error: (err) => {
          console.error('Lỗi lấy danh mục:', err);
        }
      })
    }getAllThuongHieu(){
      this.thuonghieuService.getThuonghieu().subscribe({
        next: (data) => {
          this.thuongHieuList = data;
        },
        error: (err) => {
          console.error('Lỗi lấy thương hiệu:', err);
        }
      })
    }
    async addProduct() {
      if (this.productForm.invalid) {
        this.productForm.markAllAsTouched(); // Hiển thị tất cả lỗi
        // alert('Vui lòng điền đầy đủ thông tin sản phẩm!');
        return;
      }

      const formValues = this.productForm.value;
      const formData = new FormData();

      // Hàm xử lý thêm từng mùi hương (trả về ID nếu thành công)
      const addHuong = async (
        service: any,
        moTaField: string,         // Tên field backend cần (ví dụ: motaHuongDau)
        moTaValue: string | null   // Giá trị người dùng nhập
      ): Promise<number | null> => {
        if (!moTaValue) return null;
        const body = { [moTaField]: moTaValue };

        console.log(`🚀 Gửi đến ${moTaField}:`, body); // Logging để kiểm tra dữ liệu gửi đi

        try {
          const response: any = await firstValueFrom(service.add(body));
          console.log(`✅ Server trả về từ ${moTaField}:`, response);
          return response?.id || null;
        } catch (error) {
          console.error(`❌ Lỗi khi thêm ${moTaField}:`, error);
          return null;
        }
      };

      try {
        // Gọi đồng thời 3 API thêm mùi hương
        const [idHuongDau, idHuongGiua, idHuongCuoi] = await Promise.all([
          addHuong(this.huondauService, 'motaHuongDau', formValues.huongDau),
          addHuong(this.huonggiuaService, 'moTaHuongGiua', formValues.huongGiua),
          addHuong(this.huongcuoiService, 'moTaHuongCuoi', formValues.huongCuoi),
        ]);

        // Gửi thông tin sản phẩm (kèm ID các mùi hương vừa tạo)
        formData.append('ten', formValues.ten || '');
        formData.append('moTa', formValues.moTa || '');
        formData.append('idThuongHieu', String(formValues.idThuongHieu));
        formData.append('idDanhMuc', String(formValues.idDanhMuc));
        formData.append('idHuongDau', String(idHuongDau || ''));
        formData.append('idHuongGiua', String(idHuongGiua || ''));
        formData.append('idHuongCuoi', String(idHuongCuoi || ''));

        // Thêm hình ảnh
        for (let file of this.selectedFiles) {
          formData.append('image', file);
        }

        console.log('📦 Toàn bộ FormData gửi lên:');
        formData.forEach((value, key) => {
          console.log(`➡️ ${key}:`, value instanceof File ? value.name : value);
        });

        // Gửi lên server
        this.sanphamService.addProductOnAdmin(formData).subscribe({
          next: (response) => {
            alert('✅ Thêm sản phẩm thành công!');
            this.productAdd.emit(response);
            this.closeModal();
          },
          error: (err) => {
            console.error('❌ Lỗi khi thêm sản phẩm:', err);
            alert('❌ Thêm sản phẩm thất bại. Vui lòng kiểm tra dữ liệu!');
          },
        });
      } catch (error) {
        console.error('❌ Lỗi khi thêm mùi hương:', error);
        alert('❌ Đã xảy ra lỗi khi thêm mùi hương!');
      }
    }




    onFileChange(event: any) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFiles.push(file);

        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.previewUrls.push(e.target.result); // base64
        };
        reader.readAsDataURL(file);
      }
      event.target.value = ''; // Cho phép chọn cùng file lại nếu cần
    }

    removeFile(index: number) {
      this.selectedFiles.splice(index, 1);
      this.previewUrls.splice(index, 1);
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
}
