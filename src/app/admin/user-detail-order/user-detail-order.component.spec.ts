import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserDetailOrderComponent } from './user-detail-order.component';

describe('UserDetailOrderComponent', () => {
  let component: UserDetailOrderComponent;
  let fixture: ComponentFixture<UserDetailOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDetailOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserDetailOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
