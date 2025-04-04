import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountStaffUpdateComponent } from './account-staff-update.component';

describe('AccountStaffUpdateComponent', () => {
  let component: AccountStaffUpdateComponent;
  let fixture: ComponentFixture<AccountStaffUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountStaffUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountStaffUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
