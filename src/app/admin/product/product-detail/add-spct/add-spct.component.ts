import { Component,EventEmitter,Input,ChangeDetectorRef,OnInit,Output} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ReactiveFormsModule,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SpctService } from '../../../../service/spct.service';

@Component({
  selector: 'app-add-spct',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-spct.component.html',
  styleUrls: ['./add-spct.component.scss'],
  providers: [NgbActiveModal]

})
export class AddSpctComponent implements OnInit {
  @Input() productId: number | null = null; // Nhận productId từ SpctComponent
  @Output() SpctAdded = new EventEmitter<any>();

  spctForm: FormGroup;

  constructor(
    public activeModal: NgbActiveModal,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private spcts:SpctService
  ) {
    this.spctForm = this.fb.group({
      donGia: [null, [Validators.required, Validators.min(0)]],
      dungTich: [null, [Validators.required, Validators.min(0)]],
      soLuongTonKho: [null, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    console.log("📌 productId received in modal:", this.productId);
  }


  saveProductDetail() {
    console.log('📌 Dữ liệu trong form:', this.spctForm.value);

    if (this.spctForm.valid) {
      const formData = { ...this.spctForm.value }; // 🔥 Tạo bản sao để tránh lỗi
      formData.idSanPham = this.productId; // Thêm productId vào dữ liệu form
      console.log('📤 Dữ liệu gửi đi:', formData);

      this.spcts.addSpcttOnAdmin(formData).subscribe(
        (response: any) => {
          console.log('✅ API Response:', response);
         alert('Thêm spct thành công!');
         this.SpctAdded.emit(response); //
         console.log('🔴 Đang đóng modal KK...');
         this.closeModal();
        },
        (error: any) => {
          console.error('❌ Lỗi khi thêm spct:', error);
        }
      );
    } else {
      console.warn('⚠️ Form không hợp lệ, kiểm tra lại:', this.spctForm.errors);
    }
  }
  closeModal() {
    console.log('🛑 Attempting to close modal...', this.activeModal);

    // 🟢 Gọi dismiss() trước
    if (this.activeModal) {
        this.activeModal.dismiss('cancel');
        console.log('✅ Dismiss method called');
    } else {
        console.error('❌ ActiveModal is not available');
    }

    // 🟠 Backup plan: Xóa modal bằng Bootstrap
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

        // 🔥 Kích hoạt Change Detection để cập nhật UI
        this.cdr.detectChanges();
    }, 100);
}
}
