import { Component,Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-detail-order',
  standalone: true,
  imports: [],
  templateUrl: './user-detail-order.component.html',
  styleUrl: './user-detail-order.component.scss'
})
export class UserDetailOrderComponent {
  @Input() taiKhoan: any;
  constructor(public activeModal: NgbActiveModal){}
  closeModal() {
    this.activeModal.close();
  }
}
