import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraHangUserComponent } from './tra-hang-user.component';

describe('TraHangUserComponent', () => {
  let component: TraHangUserComponent;
  let fixture: ComponentFixture<TraHangUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraHangUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraHangUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
