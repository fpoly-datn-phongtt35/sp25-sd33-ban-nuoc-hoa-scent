import { Component, EventEmitter, Input, Output, ChangeDetectorRef, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { PhieugiamgiaService } from '../../../service/phieugiamgia.service';
@Component({
  selector: 'app-edit-voucher',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './edit-voucher.component.html',
  styleUrl: './edit-voucher.component.scss',
  providers: [NgbActiveModal]
})
export class EditVoucherComponent {

  @Input() voucher: any;
  @Output() voucherUpdated = new EventEmitter<any>();
  voucherForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private phieuGiamGiaService: PhieugiamgiaService,
    private cdr: ChangeDetectorRef
  ) {
    // Khởi tạo form trống ban đầu
    this.voucherForm = this.fb.group({});
  }

  ngOnInit() {
    console.log('🔍 Dữ liệu nhận vào:', this.voucher);
    console.log('📌 Form giá trị sau khi gán:', this.voucherForm.value);

    // Khởi tạo form với dữ liệu từ voucher
    this.voucherForm = this.fb.group({
      id: [this.voucher?.id],
      maGiamGia: [this.voucher?.maGiamGia, [Validators.required, Validators.maxLength(50)]],
      giaTriGiam: [this.voucher?.giaTriGiam, [Validators.required, Validators.min(0.01), Validators.max(9999.99)]],
      ngayBatDau: [this.extractDate(this.voucher?.ngayBatDau), Validators.required],
      gioPhutBatDau: [this.extractTime(this.voucher?.ngayBatDau), Validators.required],
      ngayHetHan: [this.extractDate(this.voucher?.ngayHetHan), Validators.required],
      gioPhutHetHan: [this.extractTime(this.voucher?.ngayHetHan), Validators.required],
      soLuong: [this.voucher?.soLuong || 0, [Validators.required, Validators.min(1)]],
      gia_tri_toi_da: [this.voucher?.gia_tri_toi_da || null, [Validators.min(0)]],
      dieuKienapDung: [this.voucher?.dieuKienapDung || 0, [Validators.required, Validators.min(0)]]
    });
  }

  updateVoucher() {
    if (this.voucherForm.valid) {
      const formData = { ...this.voucherForm.value };

      // ✅ Gộp ngày & giờ đúng định dạng
      formData.ngayBatDau = this.combineDateTime(formData.ngayBatDau, formData.gioPhutBatDau);
      formData.ngayHetHan = this.combineDateTime(formData.ngayHetHan, formData.gioPhutHetHan);

      // 🚀 Xóa dữ liệu thừa trước khi gửi API
      delete formData.gioPhutBatDau;
      delete formData.gioPhutHetHan;
      console.log("📤 Dữ liệu gửi đi:", formData);

      this.phieuGiamGiaService.updateVoucher(formData).subscribe(
        (response: any) => {
          alert('Cập nhật voucher thành công!');
          this.voucherUpdated.emit(response);
          this.closeModal(); // Đóng modal và gửi dữ liệu mới
        },
        (error: any) => {
          console.error('❌ Lỗi khi cập nhật voucher:', error);
        }
      );
    } else {
      console.warn('⚠️ Form không hợp lệ');
    }
  }

  combineDateTime(date: string, time: string): string {
    if (!date || !time) return '';
    return `${date}T${time}:00`; // Format `YYYY-MM-DDTHH:mm:ss`
  }

  extractDate(datetime: string | null): string {
    if (!datetime) return '';
    return datetime.split('T')[0]; // Lấy phần YYYY-MM-DD
  }

  extractTime(datetime: string | null): string {
    if (!datetime) return '';
    return datetime.split('T')[1]?.slice(0, 5) || ''; // Lấy HH:mm
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
}