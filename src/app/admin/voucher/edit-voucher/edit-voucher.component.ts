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
export class EditVoucherComponent implements OnInit {
  @Input() voucher: any;
  @Output() voucherUpdated = new EventEmitter<any>();
  voucherForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public activeModal: NgbActiveModal,
    private phieuGiamGiaService: PhieugiamgiaService,
    private cdr: ChangeDetectorRef
  ) {
    this.voucherForm = this.fb.group({});
  }

  ngOnInit() {
    console.log('🔍 Dữ liệu nhận vào:', this.voucher);

    // Khởi tạo form với dữ liệu từ voucher
    this.voucherForm = this.fb.group({
      id: [this.voucher?.id],
      maGiamGia: [this.voucher?.maGiamGia, [Validators.required, Validators.maxLength(50)]],
      giaTriGiam: [this.voucher?.giaTriGiam, [Validators.required, Validators.min(0.1), Validators.max(0.8)]], // Giữ nguyên validate giống AddVoucherComponent
      ngayBatDau: [this.extractDate(this.voucher?.ngayBatDau), Validators.required],
      gioPhutBatDau: [this.extractTime(this.voucher?.ngayBatDau), Validators.required],
      ngayHetHan: [this.extractDate(this.voucher?.ngayHetHan), Validators.required],
      gioPhutHetHan: [this.extractTime(this.voucher?.ngayHetHan), Validators.required],
      soLuong: [this.voucher?.soLuong || 0, [Validators.required, Validators.min(1)]],
      gia_tri_toi_da: [this.voucher?.gia_tri_toi_da || null, [Validators.min(0)]],
      dieuKienapDung: [this.voucher?.dieuKienapDung || 0, [Validators.required]], // Chỉ cần required, không cần min(0) vì dùng dropdown
      giaTriDonToiThieu: [this.voucher?.giaTriDonToiThieu || 0.01, [Validators.required, Validators.min(0.01)]] // Thêm trường giá trị đơn tối thiểu
    });

    console.log('📌 Form giá trị sau khi gán:', this.voucherForm.value);
    this.cdr.detectChanges(); // Đảm bảo giao diện được render
  }

  updateVoucher() {
    if (this.voucherForm.valid) {
      const formData = { ...this.voucherForm.value };

      // Kết hợp ngày và giờ
      const start = new Date(this.combineDateTime(formData.ngayBatDau, formData.gioPhutBatDau));
      const end = new Date(this.combineDateTime(formData.ngayHetHan, formData.gioPhutHetHan));

      // Kiểm tra ngày bắt đầu và kết thúc
      if (start >= end) {
        alert('❌ Ngày và giờ bắt đầu phải trước ngày và giờ kết thúc.');
        return;
      }

      formData.ngayBatDau = this.combineDateTime(formData.ngayBatDau, formData.gioPhutBatDau);
      formData.ngayHetHan = this.combineDateTime(formData.ngayHetHan, formData.gioPhutHetHan);

      // Xóa các trường không cần thiết
      delete formData.gioPhutBatDau;
      delete formData.gioPhutHetHan;

      console.log("📤 Dữ liệu gửi đi:", formData);

      this.phieuGiamGiaService.updateVoucher(formData).subscribe(
        (response: any) => {
          alert('Cập nhật voucher thành công!');
          this.voucherUpdated.emit(response);
          this.closeModal();
        },
        (error: any) => {
          console.error('❌ Lỗi khi cập nhật voucher:', error);
          alert(`Lỗi: ${error.message || 'Không thể cập nhật voucher. Vui lòng thử lại!'}`);
        }
      );
    } else {
      console.warn('⚠️ Form không hợp lệ:', this.voucherForm.errors);
      alert('Vui lòng điền đầy đủ và đúng định dạng các trường bắt buộc.');
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