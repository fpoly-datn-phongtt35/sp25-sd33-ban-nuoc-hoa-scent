import { Component,Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-hoadon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hoadon.component.html',
  styleUrl: './hoadon.component.scss'
})
export class HoadonComponent {
  @Input() orderId: string = '';

  @Input() orderData: any;
  constructor(public activeModal: NgbActiveModal) {}
  ngOnInit() {
    console.log('🧾 orderData:', this.orderData);
  }
  close() {
    this.activeModal.dismiss('Cross click');
  }
}
