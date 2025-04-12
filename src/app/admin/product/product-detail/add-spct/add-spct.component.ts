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
  showProminenceModal: boolean = false;
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
    console.log('🛑 Đang cố đóng modal chính...');

    if (this.showProminenceModal) {
      console.log('🔄 Đóng modal con (prominenceModal) trước...');

    }

    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
      console.log('✅ Đã gọi dismiss trên modal chính');
    } else {
      console.error('❌ ActiveModal không khả dụng');
    }

    this.finalizeModalClose();
  }

  private finalizeModalClose() {
    console.log('🧹 Dọn dẹp trạng thái modal...');

    document.body.classList.remove('modal-open');

    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      console.log('🗑️ Xóa backdrop:', backdrop);
      backdrop.remove();
    });

    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      console.log('🗑️ Xóa lớp show khỏi modal:', modal);
      modal.classList.remove('show');
      modal.remove();
    });

    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';

    this.cdr.detectChanges();
    console.log('✅ Đã dọn dẹp trạng thái modal');
  }
}
