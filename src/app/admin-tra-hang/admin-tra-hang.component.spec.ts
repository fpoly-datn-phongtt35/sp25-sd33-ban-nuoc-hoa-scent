import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTraHangComponent } from './admin-tra-hang.component';

describe('AdminTraHangComponent', () => {
  let component: AdminTraHangComponent;
  let fixture: ComponentFixture<AdminTraHangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTraHangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTraHangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
