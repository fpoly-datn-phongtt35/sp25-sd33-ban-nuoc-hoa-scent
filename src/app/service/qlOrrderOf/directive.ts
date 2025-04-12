import { Directive, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Directive({
  selector: '[debounce]',
})
export class DebounceDirective implements OnInit, OnDestroy {
  @Input() debounce = 300; // Thời gian debounce mặc định (ms)
  @Output() ngModelChange = new EventEmitter<any>();

  private inputSubject = new Subject<any>();
  private subscription: Subscription;

  ngOnInit() {
    this.subscription = this.inputSubject.pipe(debounceTime(this.debounce)).subscribe(value => {
      this.ngModelChange.emit(value);
    });
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: any) {
    this.inputSubject.next(value);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}