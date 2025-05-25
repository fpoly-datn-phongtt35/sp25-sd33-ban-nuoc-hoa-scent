import { Component, EventEmitter, OnInit, Output, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ValidatorFn, AbstractControl, ValidationErrors, NG_VALIDATORS, Validator } from '@angular/forms';
import { NotHuongService } from '../../../service/nothuong.service';

export interface NotHuong {
  id?: number;
  tenNotHuong: string;
  moTa: string;
}

// Validator cho Tên Nốt Hương (bao gồm kiểm tra ký tự đặc biệt)
export function tenNotHuongValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value || value.trim().length === 0) {
      return { required: true };
    }

    const trimmedValue = value.trim();

    if (/^\d+$/.test(trimmedValue)) {
      return { onlyNumbers: true };
    }

    if (/[@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(trimmedValue)) {
      return { specialCharacters: true };
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

// Validator cho Mô Tả (không kiểm tra ký tự đặc biệt)
export function moTaValidator(): ValidatorFn {
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

// Directive cho Tên Nốt Hương
@Directive({
  selector: '[tenNotHuongValidator]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: TenNotHuongValidatorDirective, multi: true }]
})
export class TenNotHuongValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return tenNotHuongValidator()(control);
  }
}

// Directive cho Mô Tả
@Directive({
  selector: '[moTaValidator]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: MoTaValidatorDirective, multi: true }]
})
export class MoTaValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return moTaValidator()(control);
  }
}

@Component({
  selector: 'app-add-not-huong',
  standalone: true,
  imports: [CommonModule, FormsModule, TenNotHuongValidatorDirective, MoTaValidatorDirective],
  templateUrl: './add-not-huong.component.html',
  styleUrls: ['./add-not-huong.component.scss']
})
export class AddNotHuongComponent implements OnInit {
  @Output() close = new EventEmitter<void>();
  @Output() notHuongAdded = new EventEmitter<NotHuong>();

  notHuong: NotHuong = { tenNotHuong: '', moTa: '' };

  constructor(private notHuongService: NotHuongService) {}

  ngOnInit(): void {}

  onSubmit(): void {
    const payload = {
      tenNotHuong: this.notHuong.tenNotHuong.trim(),
      moTa: this.notHuong.moTa.trim()
    };
    this.notHuongService.addNotHuong(payload).subscribe({
      next: (newNotHuong) => {
        this.notHuongAdded.emit({
          id: newNotHuong.id,
          tenNotHuong: newNotHuong.tenNotHuong,
          moTa: newNotHuong.moTa
        });
        this.close.emit();
      },
      error: (err) => console.error('Lỗi khi thêm Nốt Hương:', err)
    });
  }
}