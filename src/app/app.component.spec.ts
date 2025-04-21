import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatOverlayService } from './service/ChatOverlay.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, OverlayModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  shouldShowChatButton = true;

  constructor(
    private chatOverlayService: ChatOverlayService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Kiểm tra URL ban đầu
    this.checkUrl();
    // Lắng nghe sự kiện thay đổi URL
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        console.log('[AppComponent] NavigationEnd event:', event.urlAfterRedirects);
        this.checkUrl();
      });
  }

  private checkUrl(): void {
    const currentUrl = this.router.url;
    this.shouldShowChatButton = !currentUrl.includes('/admin');
    console.log('[AppComponent] Current URL:', currentUrl, 'Should show chat button:', this.shouldShowChatButton);
  }

  toggleChat(): void {
    this.chatOverlayService.toggleChat();
  }
}