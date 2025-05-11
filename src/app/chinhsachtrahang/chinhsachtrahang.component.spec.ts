import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChinhsachtrahangComponent } from './chinhsachtrahang.component';

describe('ChinhsachtrahangComponent', () => {
  let component: ChinhsachtrahangComponent;
  let fixture: ComponentFixture<ChinhsachtrahangComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChinhsachtrahangComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChinhsachtrahangComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
