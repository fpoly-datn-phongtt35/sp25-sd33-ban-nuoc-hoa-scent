import { Component, OnInit } from '@angular/core';
   import { RouterOutlet } from '@angular/router';
   import { ChatOverlayService } from './service/ChatOverlay.service';
   import { OverlayModule } from '@angular/cdk/overlay';
   import { Router, NavigationEnd } from '@angular/router';
   import { filter } from 'rxjs/operators';
   import { CommonModule } from '@angular/common';

   @Component({
     selector: 'app-root',
     standalone: true,
     imports: [RouterOutlet, OverlayModule, CommonModule],
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
         .subscribe(() => {
           this.checkUrl();
           // Đóng khung chat khi điều hướng để tránh trùng lặp instance
           this.chatOverlayService.closeChat();
         });
     }

     private checkUrl(): void {
       const currentUrl = this.router.url;
       this.shouldShowChatButton = !currentUrl.includes('/admin');
       
     }

     toggleChat(): void {
       this.chatOverlayService.toggleChat();
     }
   }