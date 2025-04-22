import { Injectable } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ContactComponent } from '../contact/contact.component';

@Injectable({
  providedIn: 'root',
})
export class ChatOverlayService {
  private overlayRef: OverlayRef | null = null;

  constructor(private overlay: Overlay) {}

  openChat(): void {
    if (this.overlayRef) {
      console.log('[ChatOverlayService] Chat đã mở, bỏ qua');
      return;
    }
  
    this.overlayRef = this.overlay.create({
      positionStrategy: this.overlay
        .position()
        .global()
        .bottom('20px')
        .right('20px'),
      hasBackdrop: false,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
    });
  
    const chatPortal = new ComponentPortal(ContactComponent);
    const componentRef = this.overlayRef.attach(chatPortal);
    console.log('[ChatOverlayService] Đã mở chat nổi');
  
    // Tăng thời gian trì hoãn để đảm bảo DOM được render
    setTimeout(() => {
      if (componentRef.instance) {
        componentRef.instance.ngOnInit();
        componentRef.instance.initializeChat();
      }
    }, 200); // Tăng lên 200ms để đảm bảo DOM sẵn sàng
  
    componentRef.instance.onClose.subscribe(() => {
      this.closeChat();
    });
  }

  closeChat(): void {
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
      this.overlayRef = null;
      console.log('[ChatOverlayService] Đã đóng chat nổi');
    }
  }

  toggleChat(): void {
    if (this.overlayRef) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }
}