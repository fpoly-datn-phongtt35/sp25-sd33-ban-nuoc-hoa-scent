import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraHangComponent } from './tra-hang.component';
import { CommonModule } from '@angular/common';
describe('TraHangComponent', () => {
  let component: TraHangComponent;
  let fixture: ComponentFixture<TraHangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraHangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraHangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
