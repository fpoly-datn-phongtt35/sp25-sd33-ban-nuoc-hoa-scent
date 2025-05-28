import { Component, EventEmitter, Input, OnInit, Output, Directive, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ValidatorFn, AbstractControl, ValidationErrors, NG_VALIDATORS, Validator } from '@angular/forms';
import { NotHuongService } from '../../../service/nothuong.service';
import { Subscription } from 'rxjs';

// Định nghĩa interface cho NotHuong
export interface NotHuong {
  id?: number;
  tenNotHuong: string;
  moTa: string;
  muiHuongId?: number;
  muiHuong?: MuiHuong;
}

// Định nghĩa interface cho MuiHuong
export interface MuiHuong {
  id: number;
  tenMuiHuong: string;
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
  selector: 'app-update-not-huong',
  standalone: true,
  imports: [CommonModule, FormsModule, TenNotHuongValidatorDirective, MoTaValidatorDirective],
  templateUrl: './update-not-huong.component.html',
  styleUrls: ['./update-not-huong.component.scss']
})
export class UpdateNotHuongComponent implements OnInit, OnDestroy {
  @Input() notHuong: NotHuong = { tenNotHuong: '', moTa: '', muiHuongId: undefined };
  @Output() close = new EventEmitter<void>();
  @Output() notHuongUpdated = new EventEmitter<NotHuong>();
  errorMessage: string = '';
  muiHuongs: MuiHuong[] = [];
  private muiHuongSubscription: Subscription;

  constructor(private notHuongService: NotHuongService) {}

  ngOnInit(): void {
    // Đăng ký lắng nghe danh sách mùi hương từ service
    this.muiHuongSubscription = this.notHuongService.muiHuongs$.subscribe({
      next: (muiHuongs) => {
        this.muiHuongs = muiHuongs;
      },
      error: (err) => {
        console.error('Lỗi khi tải danh sách mùi hương:', err);
        this.muiHuongs = [];
      }
    });
  }

  ngOnDestroy(): void {
    if (this.muiHuongSubscription) {
      this.muiHuongSubscription.unsubscribe();
    }
  }

  onSubmit(): void {
    if (!this.notHuong.muiHuongId) {
      this.errorMessage = 'Vui lòng chọn một mùi hương.';
      return;
    }

    if (this.notHuong.id !== undefined) {
      this.errorMessage = '';
      const payload = {
        tenNotHuong: this.notHuong.tenNotHuong.trim(),
        moTa: this.notHuong.moTa.trim(),
        idmuiHuong: this.notHuong.muiHuongId
      };
      this.notHuongService.updateNotHuong(this.notHuong.id, payload).subscribe({
        next: (updatedNotHuong) => {
          const selectedMuiHuong = this.muiHuongs.find(mh => mh.id === updatedNotHuong.muiHuongId);
          this.notHuongUpdated.emit({
            id: updatedNotHuong.id,
            tenNotHuong: updatedNotHuong.tenNotHuong,
            moTa: updatedNotHuong.moTa,
            muiHuongId: updatedNotHuong.muiHuongId,
            muiHuong: selectedMuiHuong
          });
          this.close.emit();
          // Làm mới danh sách mùi hương sau khi sửa nốt hương
          this.notHuongService.loadMuiHuongs();
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật Nốt Hương:', err);
          this.errorMessage = 'Không thể cập nhật nốt hương: ' + (err.message || 'Lỗi không xác định');
        }
      });
    }
  }
}