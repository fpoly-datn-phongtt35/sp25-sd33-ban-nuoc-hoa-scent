import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotHuongComponent } from './not-huong.component';

describe('NotHuongComponent', () => {
  let component: NotHuongComponent;
  let fixture: ComponentFixture<NotHuongComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotHuongComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotHuongComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
