import { Component, EventEmitter, Output, Directive } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ValidatorFn, AbstractControl, ValidationErrors, NG_VALIDATORS, Validator } from '@angular/forms';
import { PhongCachService } from '../../../service/PhongCach.service';

export interface PhongCach {
  id?: number;
  tenPhongCach: string;
  moTa: string;
}

// Validator cho Tên Phong Cách (bao gồm kiểm tra ký tự đặc biệt)
export function tenPhongCachValidator(): ValidatorFn {
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

// Directive cho Tên Phong Cách
@Directive({
  selector: '[tenPhongCachValidator]',
  standalone: true,
  providers: [{ provide: NG_VALIDATORS, useExisting: TenPhongCachValidatorDirective, multi: true }]
})
export class TenPhongCachValidatorDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return tenPhongCachValidator()(control);
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
  selector: 'app-add-phong-cach',
  standalone: true,
  imports: [CommonModule, FormsModule, TenPhongCachValidatorDirective, MoTaValidatorDirective],
  templateUrl: './add-phong-cach.component.html',
  styleUrls: ['./add-phong-cach.component.scss']
})
export class AddPhongCachComponent {
  @Output() close = new EventEmitter<void>();
  @Output() phongCachAdded = new EventEmitter<PhongCach>();

  phongCach: PhongCach = { tenPhongCach: '', moTa: '' };

  constructor(private phongCachService: PhongCachService) {}

  onSubmit(): void {
    const payload = {
      tenPhongCach: this.phongCach.tenPhongCach.trim(),
      moTa: this.phongCach.moTa.trim()
    };
    this.phongCachService.addPhongCach(payload).subscribe({
      next: (newPhongCach) => {
        this.phongCachAdded.emit(newPhongCach);
        this.close.emit();
      },
      error: (err) => console.error('Error adding PhongCach:', err)
    });
  }
}