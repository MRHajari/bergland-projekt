import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccommodationsAdmin } from './accommodations-admin';

describe('AccommodationsAdmin', () => {
  let component: AccommodationsAdmin;
  let fixture: ComponentFixture<AccommodationsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccommodationsAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AccommodationsAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
