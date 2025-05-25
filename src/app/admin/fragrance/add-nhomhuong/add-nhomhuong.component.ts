import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NhomHuongService } from '../../../service/nhomhuong.service';

// Custom validator cho Tên Nhóm Hương (không kiểm tra ký tự đặc biệt)
function tenNhomHuongValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || value.trim().length === 0) {
      return { required: true };
    }

    const trimmedValue = value.trim();

    if (/^\d+$/.test(trimmedValue)) {
      return { onlyNumbers: true };
    }

    const hasLetter = /[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸýỵỷỹ]/.test(trimmedValue);
    const hasSpace = /\s/.test(trimmedValue);
    const letterCount = (trimmedValue.match(/[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸýỵỷỹ]/g) || []).length;

    if (!hasLetter || !hasSpace || letterCount < 2) {
      return { invalidFormat: true };
    }

    return null;
  };
}

// Custom validator cho Mô Tả (không kiểm tra ký tự đặc biệt)
function moTaValidator(): (control: AbstractControl) => ValidationErrors | null {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || value.trim().length === 0) {
      return { required: true };
    }

    const trimmedValue = value.trim();

    if (/^\d+$/.test(trimmedValue)) {
      return { onlyNumbers: true };
    }

    const hasLetter = /[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸýỵỷỹ]/.test(trimmedValue);
    const hasSpace = /\s/.test(trimmedValue);
    const letterCount = (trimmedValue.match(/[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲỴÝỶỸýỵỷỹ]/g) || []).length;

    if (!hasLetter || !hasSpace || letterCount < 2) {
      return { invalidFormat: true };
    }

    return null;
  };
}

@Component({
  selector: 'app-add-nhomhuong',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-nhomhuong.component.html',
  styleUrls: ['./add-nhomhuong.component.scss']
})
export class AddNhomhuongComponent {
  @Output() nhomHuongAdded = new EventEmitter<any>();
  addForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private nhomHuongService: NhomHuongService,
    public activeModal: NgbActiveModal
  ) {
    this.addForm = this.fb.group({
      tenNhomHuong: ['', [Validators.required, Validators.minLength(3), tenNhomHuongValidator()]],
      mota: ['', [Validators.required, moTaValidator()]]
    });
  }

  onSubmit(): void {
    if (this.addForm.valid) {
      const payload = {
        tenNhomHuong: this.addForm.value.tenNhomHuong.trim(),
        mota: this.addForm.value.mota.trim()
      };
      this.nhomHuongService.createNhomHuong(payload).subscribe({
        next: (newNhomHuong) => {
          this.nhomHuongAdded.emit(newNhomHuong);
          this.activeModal.close('Save');
        },
        error: (err) => console.error('Error creating NhomHuong:', err)
      });
    }
  }
}