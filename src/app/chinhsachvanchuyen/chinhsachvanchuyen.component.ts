import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-chinhsachvanchuyen',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './chinhsachvanchuyen.component.html',
  styleUrl: './chinhsachvanchuyen.component.scss'
})
export class ChinhsachvanchuyenComponent {

}
