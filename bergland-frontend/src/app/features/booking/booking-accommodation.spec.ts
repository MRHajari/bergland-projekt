import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingAccommodation } from './booking-accommodation';

describe('Booking', () => {
  let component: BookingAccommodation;
  let fixture: ComponentFixture<BookingAccommodation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingAccommodation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingAccommodation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
