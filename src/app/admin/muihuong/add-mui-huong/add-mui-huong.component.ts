import { Component, EventEmitter, Output, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ValidatorFn, AbstractControl, ValidationErrors, NG_VALIDATORS, Validator } from '@angular/forms';
import { MuiHuongService } from '../../../service/muihuong.service';

export interface MuiHuong {
  id?: number;
  tenMuiHuong: string;
  moTa: string;
}

// Validator cho Tên Mùi Hương (bao gồm kiểm tra ký tự đặc biệt)
export function tenMuiHuongValidator(): ValidatorFn {
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

// Directive cho Tên Mùi Hương
@Directive({
  selector: '[tenMuiHuongValidator]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: TenMuiHuongValidatorDirective, multi: true }]
})
export class TenMuiHuongValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return tenMuiHuongValidator()(control);
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
  selector: 'app-add-mui-huong',
  standalone: true,
  imports: [CommonModule, FormsModule, TenMuiHuongValidatorDirective, MoTaValidatorDirective],
  templateUrl: './add-mui-huong.component.html',
  styleUrls: ['./add-mui-huong.component.scss']
})
export class AddMuiHuongComponent {
  @Output() close = new EventEmitter<void>();
  @Output() muiHuongAdded = new EventEmitter<MuiHuong>();

  muiHuong: MuiHuong = { tenMuiHuong: '', moTa: '' };

  constructor(private muiHuongService: MuiHuongService) {}

  onSubmit(): void {
    const payload = {
      tenMuiHuong: this.muiHuong.tenMuiHuong.trim(),
      moTa: this.muiHuong.moTa.trim()
    };
    this.muiHuongService.addMuiHuong(payload).subscribe({
      next: (newMuiHuong) => {
        this.muiHuongAdded.emit(newMuiHuong);
        this.close.emit();
      },
      error: (err) => console.error('Error adding MuiHuong:', err)
    });
  }
}