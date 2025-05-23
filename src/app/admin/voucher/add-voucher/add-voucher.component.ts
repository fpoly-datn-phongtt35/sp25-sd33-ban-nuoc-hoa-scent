import { Component, EventEmitter, Input, Output, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { NgbActiveModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { PhieugiamgiaService } from '../../../service/phieugiamgia.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PercentTransformPipe } from '../../../service/PercentTransformPipe';

// Validator tùy chỉnh
function noSpecialCharactersOrOnlySpacesValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const value = control.value as string;

    // Kiểm tra nếu chỉ chứa dấu cách
    if (value && value.trim().length === 0) {
      return { onlySpaces: true };
    }

    // Kiểm tra ký tự đặc biệt (cho phép chữ cái, số, gạch dưới, không cho phép ký tự đặc biệt khác)
    const specialCharRegex = /^[a-zA-Z0-9_]+$/;
    if (value && !specialCharRegex.test(value)) {
      return { specialCharacters: true };
    }

    // Kiểm tra nếu chỉ chứa ký tự đặc biệt (trường hợp này không cần vì regex trên đã xử lý)
    return null;
  };
}

@Component({
  selector: 'app-add-voucher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgbModule, PercentTransformPipe],
  templateUrl: './add-voucher.component.html',
  styleUrls: ['./add-voucher.component.scss'],
  providers: [NgbActiveModal]
})
export class AddVoucherComponent {
  @Input() voucher: any = null;
  @Output() voucherAdded = new EventEmitter<any>();
  @Output() voucherUpdated = new EventEmitter<any>();
  voucherForm: FormGroup;
  errorMessage: string | null = null;
  isCodeExists: boolean = false;
  fieldErrors: { [key: string]: string } = {};

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private phieuGiamGiaService: PhieugiamgiaService,
    private cdr: ChangeDetectorRef
  ) {
    this.voucherForm = this.fb.group({
      maGiamGia: ['', [
        Validators.required,
        Validators.maxLength(50),
        noSpecialCharactersOrOnlySpacesValidator() // Thêm validator tùy chỉnh
      ]],
      giaTriGiam: [null, [Validators.required, Validators.min(0.1), Validators.max(0.9)]],
      ngayBatDau: ['', Validators.required],
      gioPhutBatDau: ['', Validators.required],
      ngayHetHan: ['', Validators.required],
      gioPhutHetHan: ['', Validators.required],
      soLuong: [null, [Validators.required, Validators.min(1)]],
      gia_tri_toi_da: [null, [Validators.min(0)]],
      dieuKienapDung: [0, [Validators.required, Validators.min(0)]],
      giaTriDonToiThieu: [null, [Validators.required, Validators.min(0.01)]]
    });

    if (this.voucher) {
      this.populateForm();
    }
  }

  // Các phương thức khác giữ nguyên, chỉ cần cập nhật phần hiển thị lỗi trong template
  updatePercent(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value;
    const numericValue = value ? parseFloat(value) : null;
    const decimalValue = numericValue ? numericValue / 100 : null;
    if (decimalValue !== null && (decimalValue < 0.1 || decimalValue > 0.9)) {
      this.voucherForm.get('giaTriGiam')?.setErrors({ range: true });
    } else {
      this.voucherForm.get('giaTriGiam')?.setValue(decimalValue, { emitEvent: false });
      this.voucherForm.get('giaTriGiam')?.markAsTouched();
    }
    this.cdr.detectChanges();
  }

  populateForm() {
    const startDateTime = new Date(this.voucher.ngayBatDau);
    const endDateTime = new Date(this.voucher.ngayHetHan);

    this.voucherForm.patchValue({
      maGiamGia: this.voucher.maGiamGia,
      giaTriGiam: this.voucher.giaTriGiam,
      ngayBatDau: this.formatDate(startDateTime),
      gioPhutBatDau: this.formatTime(startDateTime),
      ngayHetHan: this.formatDate(endDateTime),
      gioPhutHetHan: this.formatTime(endDateTime),
      soLuong: this.voucher.soLuong,
      gia_tri_toi_da: this.voucher.gia_tri_toi_da,
      dieuKienapDung: this.voucher.dieuKienapDung,
      giaTriDonToiThieu: this.voucher.giaTriDonToiThieu
    });
  }

  saveVoucher() {
    this.errorMessage = null;
    this.isCodeExists = false;
    this.fieldErrors = {};

    if (this.voucherForm.valid) {
      const formData = { ...this.voucherForm.value };
      const start = new Date(this.combineDateTime(formData.ngayBatDau, formData.gioPhutBatDau));
      const end = new Date(this.combineDateTime(formData.ngayHetHan, formData.gioPhutHetHan));

      if (start >= end) {
        this.errorMessage = 'Ngày và giờ bắt đầu phải trước ngày và giờ kết thúc.';
        this.cdr.detectChanges();
        return;
      }

      formData.ngayBatDau = this.combineDateTime(formData.ngayBatDau, formData.gioPhutBatDau);
      formData.ngayHetHan = this.combineDateTime(formData.ngayHetHan, formData.gioPhutHetHan);
      delete formData.gioPhutBatDau;
      delete formData.gioPhutHetHan;

      const action = this.voucher
        ? this.phieuGiamGiaService.updateVoucher(this.voucher.id, formData)
        : this.phieuGiamGiaService.addVoucher(formData);

      action.subscribe(
        (response: any) => {
          this.errorMessage = null;
          if (this.voucher) {
            this.voucherUpdated.emit(response);
          } else {
            this.voucherAdded.emit(response);
            this.reloadTableAndGoToFirstPage();
          }
          this.closeModal();
        },
        (error: HttpErrorResponse) => {
          console.error('Lỗi khi lưu voucher:', error);
          this.errorMessage = error.message || 'Đã xảy ra lỗi. Vui lòng thử lại!';
          if (error.status === 400 && this.errorMessage.includes(': ')) {
            this.parseFieldErrors(this.errorMessage);
          } else if (this.errorMessage.includes('Mã giảm giá đã tồn tại')) {
            this.isCodeExists = true;
          }
          this.cdr.detectChanges();
        }
      );
    } else {
      this.errorMessage = 'Vui lòng điền đầy đủ và đúng định dạng các trường bắt buộc.';
      this.cdr.detectChanges();
    }
  }

  private reloadTableAndGoToFirstPage() {
    const reloadEvent = new CustomEvent('reloadTableAndGoToFirstPage', { detail: { page: 1 } });
    window.dispatchEvent(reloadEvent);
  }

  private parseFieldErrors(errorMessage: string) {
    const errors = errorMessage.split('; ').filter(e => e.includes(': '));
    errors.forEach(error => {
      const [field, message] = error.split(': ');
      this.fieldErrors[field] = message;
    });
  }

  closeModal() {
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
    }
    setTimeout(() => {
      const modalElement = document.querySelector('.modal');
      if (modalElement) {
        modalElement.remove();
      }
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove('modal-open');
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '';
      this.cdr.detectChanges();
    }, 100);
  }

  combineDateTime(date: string, time: string): string {
    if (!date || !time) return '';
    return `${date}T${time}:00`;
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  formatTime(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  reloadTable() {
    const event = new CustomEvent('reloadTable');
    window.dispatchEvent(event);
  }
}