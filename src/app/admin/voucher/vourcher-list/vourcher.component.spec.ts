import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VourcherComponent } from './vourcher.component';

describe('VourcherComponent', () => {
  let component: VourcherComponent;
  let fixture: ComponentFixture<VourcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VourcherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VourcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
