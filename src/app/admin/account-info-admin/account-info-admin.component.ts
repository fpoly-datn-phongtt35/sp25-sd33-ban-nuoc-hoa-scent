import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService } from '../../service/taikhoan.service';
import { TokenService } from '../../service/token.service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';


@Component({
  selector: 'app-account-info-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-info-admin.component.html',
  styleUrls: ['./account-info-admin.component.scss']
})
export class AccountInfoAdminComponent implements OnInit {
  userInfo: any = {};
  showModal: boolean = true;

  constructor(
    private accountService: AccountService,
    private tokenService: TokenService,
    public activeModal: NgbActiveModal,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
  }

  loadUserInfo(): void {
    const token = this.tokenService.getToken();
    if (token && !this.tokenService.isTokenExpired()) {
      const username = this.tokenService.getUserInfo()?.sub;
      if (username) {
        this.accountService.findByUsername(username).subscribe({
          next: (data) => {
            this.userInfo = data;
          },
          error: (err) => {
            console.error('Lỗi khi lấy thông tin tài khoản:', err);
            alert('Không thể tải thông tin tài khoản!');
          },
        });
      }
    }
  }

  updateAccount(): void {
    this.accountService.updateAccount(this.userInfo).subscribe({
      next: () => {
        alert('Cập nhật thông tin tài khoản thành công!');
        this.closeModal();
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật tài khoản:', err);
        alert('Cập nhật thông tin thất bại!');
      },
    });
  }

  closeModal() {


    if (this.activeModal) {
      this.activeModal.dismiss('cancel');
    }

    this.finalizeModalClose();
  }

  private finalizeModalClose() {
    document.body.classList.remove('modal-open');

    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());

    const modals = document.querySelectorAll('.modal.show');
    modals.forEach(modal => {
      modal.classList.remove('show');
      modal.remove();
    });

    document.body.style.overflow = 'auto';
    document.body.style.paddingRight = '';

    this.cdr.detectChanges();
  }
}
