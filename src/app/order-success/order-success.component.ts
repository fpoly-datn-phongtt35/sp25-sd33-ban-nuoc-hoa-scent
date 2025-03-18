import { Component,OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { DonhangService } from '../service/donhang.service';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
  orderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.orderId = this.route.snapshot.paramMap.get('orderId');
  }
  goToHomePage() {
    this.router.navigate(['/']);
  }
  viewOrderDetails() {
    if (this.orderId) {
      this.router.navigate(['/order-details', this.orderId]);
    } else {
      console.error('No Order ID provided.');
    }
  }
}
