import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-huongdanthanhtoan',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './huongdanthanhtoan.component.html',
  styleUrl: './huongdanthanhtoan.component.scss'
})
export class HuongdanthanhtoanComponent {

}
