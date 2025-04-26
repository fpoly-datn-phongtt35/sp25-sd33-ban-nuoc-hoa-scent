import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThuongHieuService } from '../../../service/thuonghieu.service';
import { ToastrService } from 'ngx-toastr';
import { EventEmitter, Output } from '@angular/core';
import { ThuongHieu } from '../brand/brand.component';

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
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.brandForm = this.fb.group({
      tenThuongHieu: ['', [Validators.required, Validators.maxLength(100)]],
      quocGia: ['', [Validators.required, Validators.maxLength(100)]],
      moTa: ['', Validators.maxLength(500)]
    });
  }

  addThuongHieu(): void {
    if (this.brandForm.valid) {
      this.thuongHieuService.addThuongHieu1(this.brandForm.value).subscribe({
        next: (newThuongHieu: ThuongHieu) => {
          console.log('API trả về thương hiệu:', newThuongHieu); // Debug
          this.brandAdded.emit(newThuongHieu); // Phát ra sự kiện brandAdded
          this.close.emit(); // Đóng modal
          this.brandForm.reset(); // Reset form
        },
        error: (error) => {
          this.errorMessage = error.message || 'Lỗi khi thêm thương hiệu';
          this.toastr.error(this.errorMessage, 'Lỗi');
        }
      });
    } else {
      this.errorMessage = 'Vui lòng điền đầy đủ các trường bắt buộc';
      this.toastr.error(this.errorMessage, 'Lỗi');
    }
  }

  cancel(): void {
    this.close.emit();
  }
}
