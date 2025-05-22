import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThuongHieuService } from '../../../service/thuonghieu.service';
import { EventEmitter, Output } from '@angular/core';
import { ThuongHieu } from '../brand/brand.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-brand',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-brand.component.html',
  styleUrls: ['./add-brand.component.scss']
})
export class AddBrandComponent {
  @Output() close = new EventEmitter<void>();
  @Output() brandAdded = new EventEmitter<ThuongHieu>();
  brandForm: FormGroup;
  errorMessage = '';

  constructor(
    private thuongHieuService: ThuongHieuService,
    private fb: FormBuilder
  ) {
    this.brandForm = this.fb.group({
      tenThuongHieu: ['', [Validators.required, Validators.maxLength(100)]],
      quocGia: ['', [Validators.required, Validators.maxLength(100)]],
      moTa: ['', [Validators.required, Validators.maxLength(500)]] // Bắt buộc moTa
    });
  }

  addThuongHieu(): void {
    if (this.brandForm.valid) {
      const thuongHieuData = this.brandForm.value as Omit<ThuongHieu, 'id'>;
      this.thuongHieuService.addThuongHieu1(thuongHieuData).subscribe({
        next: (newThuongHieu: ThuongHieu) => {
          console.log('API trả về thương hiệu:', newThuongHieu);
          this.brandAdded.emit(newThuongHieu);
          this.close.emit();
          this.brandForm.reset();
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Thêm thương hiệu thành công.',
            confirmButtonText: 'OK'
          });
        },
        error: (error: any) => {
          console.log('Lỗi từ API:', error); // Debug
          const errorResponse = error.error || {};
          const errorMessage = errorResponse.message || error.message || 'Lỗi không xác định';
          const errorCode = errorResponse.errorCode || '';

          if (errorCode === 'DUPLICATE_NAME' || errorMessage.toLowerCase().includes('đã tồn tại')) {
            Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: 'Tên thương hiệu đã tồn tại. Vui lòng chọn tên khác.',
              confirmButtonText: 'OK'
            });
          } else if (errorCode === 'VALIDATION_EMPTY_NAME' || errorCode === 'VALIDATION_EMPTY_COUNTRY' || errorCode === 'VALIDATION_EMPTY_DESCRIPTION') {
            this.errorMessage = errorMessage;
            Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: this.errorMessage,
              confirmButtonText: 'OK'
            });
          } else {
            this.errorMessage = 'Lỗi khi kết nối đến server';
            Swal.fire({
              icon: 'error',
              title: 'Lỗi!',
              text: this.errorMessage,
              confirmButtonText: 'OK'
            });
          }
        }
      });
    } else {
      this.errorMessage = 'Vui lòng điền đầy đủ và kiểm tra lại các trường.';
    }
  }

  cancel(): void {
    this.close.emit();
  }
}