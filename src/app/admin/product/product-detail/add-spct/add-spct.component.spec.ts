import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpctComponent } from './add-spct.component';

describe('AddSpctComponent', () => {
  let component: AddSpctComponent;
  let fixture: ComponentFixture<AddSpctComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSpctComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddSpctComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
