import { Component, EventEmitter, Output, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { PhieugiamgiaService } from '../../../service/phieugiamgia.service';

@Component({
  selector: 'app-add-voucher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-voucher.component.html',
  styleUrl: './add-voucher.component.scss',
  providers: [NgbActiveModal]
})
export class AddVoucherComponent {
  @Output() voucherAdded = new EventEmitter<any>();
  voucherForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private phieuGiamGiaService: PhieugiamgiaService,
    private cdr: ChangeDetectorRef
  ) {
    this.voucherForm = this.fb.group({
      maGiamGia: ['', [Validators.required, Validators.maxLength(50)]],
      giaTriGiam: [0, [Validators.required, Validators.min(0.1), Validators.max(0.8)]],
      ngayBatDau: ['', Validators.required],
      gioPhutBatDau: ['', Validators.required],
      ngayHetHan: ['', Validators.required],
      gioPhutHetHan: ['', Validators.required],
      soLuong: [0, [Validators.required, Validators.min(1)]],
      gia_tri_toi_da: [null, [Validators.min(0)]],
      dieuKienapDung: [0, [Validators.required, Validators.min(0)]],
      giaTriDonToiThieu: [0.01, [Validators.required, Validators.min(0.01)]] // Thêm trường giá trị đơn tối thiểu
    });
    console.log('✅ voucherForm khởi tạo:', this.voucherForm.value);
  }

  saveVoucher() {
    console.log('📌 Dữ liệu trong form:', this.voucherForm.value);

    if (this.voucherForm.valid) {
      const formData = { ...this.voucherForm.value };

      // Kết hợp ngày + giờ thành Date object để so sánh
      const start = new Date(this.combineDateTime(formData.ngayBatDau, formData.gioPhutBatDau));
      const end = new Date(this.combineDateTime(formData.ngayHetHan, formData.gioPhutHetHan));

      // Kiểm tra nếu ngày bắt đầu >= ngày kết thúc
      if (start >= end) {
        alert('❌ Ngày và giờ bắt đầu phải trước ngày và giờ kết thúc.');
        return;
      }

      // Gộp ngày giờ lại
      formData.ngayBatDau = this.combineDateTime(formData.ngayBatDau, formData.gioPhutBatDau);
      formData.ngayHetHan = this.combineDateTime(formData.ngayHetHan, formData.gioPhutHetHan);

      delete formData.gioPhutBatDau;
      delete formData.gioPhutHetHan;

      this.phieuGiamGiaService.addVoucher(formData).subscribe(
        (response: any) => {
          alert('Thêm voucher thành công!');
          this.voucherAdded.emit(response);
          this.closeModal();
        },
        (error: any) => {
          console.error('❌ Lỗi khi thêm voucher:', error);
          alert(`Lỗi: ${error.message || 'Không thể thêm voucher. Vui lòng thử lại!'}`);
        }
      );
    } else {
      console.warn('⚠️ Form không hợp lệ, kiểm tra lại:', this.voucherForm.errors);
      alert('Vui lòng điền đầy đủ và đúng định dạng các trường bắt buộc.');
    }
  }

  closeModal() {
    console.log('🛑 Attempting to close modal...', this.activeModal);

    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
      console.log('✅ Dismiss method called');
    } else {
      console.error('❌ ActiveModal is not available');
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
      console.log('✅ Forced modal removal executed');

      this.cdr.detectChanges();
    }, 100);
  }

  combineDateTime(date: string, time: string): string {
    if (!date || !time) return '';
    return `${date}T${time}:00`; // Format `YYYY-MM-DDTHH:mm:ss`
  }

  reloadTable() {
    const event = new CustomEvent('reloadTable');
    window.dispatchEvent(event);
  }
}