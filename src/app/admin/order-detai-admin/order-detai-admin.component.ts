import { Component ,Input} from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-order-detai-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-detai-admin.component.html',
  styleUrl: './order-detai-admin.component.scss'
})
export class OrderDetaiAdminComponent {
  @Input() order: any;
  constructor(public activeModal: NgbActiveModal){}


  get totalAmount() {
    return this.order.chiTietDonHangs.reduce((total: number, item: { donGia: number; soLuong: number; }) => {
      return total + (item.donGia * item.soLuong);
    }, 0);
  }
}
