import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStaffAccountComponent } from './add-staff-account.component';

describe('AddStaffAccountComponent', () => {
  let component: AddStaffAccountComponent;
  let fixture: ComponentFixture<AddStaffAccountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStaffAccountComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStaffAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
