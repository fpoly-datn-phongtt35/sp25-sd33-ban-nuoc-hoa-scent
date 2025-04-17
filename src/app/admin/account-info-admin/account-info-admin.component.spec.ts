import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountInfoAdminComponent } from './account-info-admin.component';

describe('AccountInfoAdminComponent', () => {
  let component: AccountInfoAdminComponent;
  let fixture: ComponentFixture<AccountInfoAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountInfoAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccountInfoAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
