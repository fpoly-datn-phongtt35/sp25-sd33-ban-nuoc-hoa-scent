import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
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
  selector: 'app-update-nhomhuong',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-nhomhuong.component.html',
  styleUrls: ['./update-nhomhuong.component.scss']
})
export class UpdateNhomhuongComponent implements OnInit {
  @Input() nhomHuong: any;
  @Output() nhomHuongUpdated = new EventEmitter<any>();
  updateForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private nhomHuongService: NhomHuongService,
    public activeModal: NgbActiveModal
  ) {
    this.updateForm = this.fb.group({
      tenNhomHuong: ['', [Validators.required, Validators.minLength(3), tenNhomHuongValidator()]],
      mota: ['', [Validators.required, moTaValidator()]]
    });
  }

  ngOnInit(): void {
    if (this.nhomHuong) {
      this.updateForm.patchValue({
        tenNhomHuong: this.nhomHuong.tenNhomHuong,
        mota: this.nhomHuong.mota
      });
    }
  }

  onSubmit(): void {
    if (this.updateForm.valid) {
      const payload = {
        tenNhomHuong: this.updateForm.value.tenNhomHuong.trim(),
        mota: this.updateForm.value.mota.trim()
      };
      this.nhomHuongService.updateNhomHuong(this.nhomHuong.id, payload).subscribe({
        next: (updatedNhomHuong) => {
          this.nhomHuongUpdated.emit(updatedNhomHuong);
          this.activeModal.close('Save');
        },
        error: (err) => console.error('Error updating NhomHuong:', err)
      });
    }
  }
}