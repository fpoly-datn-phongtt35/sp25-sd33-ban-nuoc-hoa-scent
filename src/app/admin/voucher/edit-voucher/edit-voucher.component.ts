import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { PhieugiamgiaService } from '../../../service/phieugiamgia.service';
import { HttpErrorResponse } from '@angular/common/http';
import { PercentTransformPipe } from '../../../service/PercentTransformPipe';


@Component({
  selector: 'app-edit-voucher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PercentTransformPipe],
  templateUrl: './edit-voucher.component.html',
  styleUrls: ['./edit-voucher.component.scss'],
  providers: [NgbActiveModal]
})
export class EditVoucherComponent implements OnInit {
  @Input() voucher: any;
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
      id: [null],
      maGiamGia: ['', [Validators.required, Validators.maxLength(50)]],
      giaTriGiam: [0, [Validators.required, Validators.min(0.1), Validators.max(0.9)]], // Updated max to 0.9 (90%)
      ngayBatDau: ['', Validators.required],
      gioPhutBatDau: ['', Validators.required],
      ngayHetHan: ['', Validators.required],
      gioPhutHetHan: ['', Validators.required],
      soLuong: [0, [Validators.required, Validators.min(1)]],
      gia_tri_toi_da: [null, [Validators.min(0)]],
      dieuKienapDung: [0, [Validators.required]],
      giaTriDonToiThieu: [0.01, [Validators.required, Validators.min(0.01)]]
    });
  }

  ngOnInit() {
    console.log('🔍 Dữ liệu nhận vào:', this.voucher);
    if (this.voucher) {
      this.populateForm();
    }
  }

  populateForm() {
    const startDateTime = new Date(this.voucher.ngayBatDau);
    const endDateTime = new Date(this.voucher.ngayHetHan);

    this.voucherForm.patchValue({
      id: this.voucher.id,
      maGiamGia: this.voucher.maGiamGia,
      giaTriGiam: this.voucher.giaTriGiam, // Lưu giá trị thập phân (0.1)
      ngayBatDau: this.formatDate(startDateTime),
      gioPhutBatDau: this.formatTime(startDateTime),
      ngayHetHan: this.formatDate(endDateTime),
      gioPhutHetHan: this.formatTime(endDateTime),
      soLuong: this.voucher.soLuong,
      gia_tri_toi_da: this.voucher.gia_tri_toi_da,
      dieuKienapDung: this.voucher.dieuKienapDung,
      giaTriDonToiThieu: this.voucher.giaTriDonToiThieu
    });

    console.log('📌 Form giá trị sau khi gán:', this.voucherForm.value);
    this.cdr.detectChanges();
  }

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

  updateVoucher() {
    this.errorMessage = null;
    this.isCodeExists = false;
    this.fieldErrors = {};
  
    if (this.voucherForm.valid) {
      const formData = { ...this.voucherForm.value };
  
      // Kết hợp ngày và giờ
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
  
      console.log('📤 Dữ liệu gửi đi:', formData);
  
      this.phieuGiamGiaService.updateVoucher(formData.id, formData).subscribe(
        (response: any) => {
          this.errorMessage = null;
          this.voucherUpdated.emit(response);
          this.closeModal();
          this.reloadTable();
        },
        (error: HttpErrorResponse) => {
          console.error('❌ Lỗi khi cập nhật voucher:', error);
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

  private parseFieldErrors(errorMessage: string) {
    const errors = errorMessage.split('; ').filter(e => e.includes(': '));
    errors.forEach(error => {
      const [field, message] = error.split(': ');
      this.fieldErrors[field] = message;
    });
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

closeModal() {
    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
    }
    // Robust modal cleanup
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

  reloadTable() {
    const event = new CustomEvent('reloadTable');
    window.dispatchEvent(event);
  }
}