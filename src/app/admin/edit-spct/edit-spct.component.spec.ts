import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSpctComponent } from './edit-spct.component';

describe('EditSpctComponent', () => {
  let component: EditSpctComponent;
  let fixture: ComponentFixture<EditSpctComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditSpctComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSpctComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
