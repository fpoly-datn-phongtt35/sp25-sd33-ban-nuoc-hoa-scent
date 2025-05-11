import { Component } from '@angular/core';
import { FooterComponent } from '../footer/footer.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-chinhsachtrahang',
  standalone: true,
  imports: [HeaderComponent, FooterComponent],
  templateUrl: './chinhsachtrahang.component.html',
  styleUrl: './chinhsachtrahang.component.scss'
})
export class ChinhsachtrahangComponent {

}
