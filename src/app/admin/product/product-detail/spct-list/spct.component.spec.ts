import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpctComponent } from './spct.component';

describe('SpctComponent', () => {
  let component: SpctComponent;
  let fixture: ComponentFixture<SpctComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpctComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SpctComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
