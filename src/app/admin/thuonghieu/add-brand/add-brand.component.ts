import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThuongHieuService, ThuongHieu } from '../../../service/thuonghieu.service';

@Component({
  selector: 'app-add-brand',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-brand.component.html',
  styleUrl: './add-brand.component.scss'
})
export class AddBrandComponent {
  @Output() close = new EventEmitter<void>();
  brandForm: FormGroup;
  errorMessage = '';

  constructor(private thuongHieuService: ThuongHieuService, private fb: FormBuilder) {
    this.brandForm = this.fb.group({
      tenThuongHieu: ['', [Validators.required, Validators.maxLength(100)]],
      quocGia: ['', [Validators.required, Validators.maxLength(100)]],
      moTa: ['', Validators.maxLength(500)]
    });
  }

  addThuongHieu(): void {
    if (this.brandForm.valid) {
      this.thuongHieuService.addThuongHieu1(this.brandForm.value).subscribe({
        next: () => {
          this.close.emit();
        },
        error: (error) => {
          this.errorMessage = error.message;
        }
      });
    } else {
      this.errorMessage = 'Vui lòng điền đầy đủ các trường bắt buộc';
    }
  }

  cancel(): void {
    this.close.emit();
  }
}