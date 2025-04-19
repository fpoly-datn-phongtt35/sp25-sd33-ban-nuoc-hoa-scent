import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThuongHieuService, ThuongHieu } from '../../../service/thuonghieu.service';

@Component({
  selector: 'app-update-brand',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-brand.component.html',
  styleUrl: './update-brand.component.scss'
})
export class UpdateBrandComponent implements OnChanges {
  @Input() thuongHieu: ThuongHieu | null = null;
  @Output() close = new EventEmitter<void>();
  brandForm: FormGroup;
  errorMessage = '';

  constructor(private thuongHieuService: ThuongHieuService, private fb: FormBuilder) {
    this.brandForm = this.fb.group({
      id: [0, Validators.required],
      tenThuongHieu: ['', [Validators.required, Validators.maxLength(100)]],
      quocGia: ['', [Validators.required, Validators.maxLength(100)]],
      moTa: ['', Validators.maxLength(500)]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['thuongHieu'] && this.thuongHieu) {
      this.brandForm.patchValue(this.thuongHieu);
    }
  }

  save(): void {
    if (this.brandForm.valid) {
      const { id, ...data } = this.brandForm.value;
      this.thuongHieuService.updateThuongHieu(id, this.brandForm.value).subscribe({
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