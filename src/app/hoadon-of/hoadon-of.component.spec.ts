import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoadonOfComponent } from './hoadon-of.component';

describe('HoadonOfComponent', () => {
  let component: HoadonOfComponent;
  let fixture: ComponentFixture<HoadonOfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HoadonOfComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoadonOfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
