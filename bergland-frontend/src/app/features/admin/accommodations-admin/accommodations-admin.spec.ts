import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

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

  it('filters displayed rows and resets pagination when searching', async () => {
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/events').flush([]);
    requests.expectOne('/api/bookings').flush([]);
    requests.expectOne('/api/accommodations').flush(
      Array.from({ length: 11 }, (_, index) => ({ id: String(index), name: `Unterkunft ${index}`, city: index === 0 ? 'Kusel' : 'Mainz' }))
    );
    component.page = 2;
    fixture.detectChanges();
    await fixture.whenStable();
    const search: HTMLInputElement = fixture.nativeElement.querySelector('#accommodation-search');
    search.value = 'Kusel';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.page).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('Unterkunft 0');
    expect(component.totalPages).toBe(1);
    requests.verify();
  });

  it('opens the labelled create form and keeps booking failures separate', () => {
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/events').flush([]);
    requests.expectOne('/api/accommodations').flush([]);
    requests.expectOne('/api/bookings').flush({}, { status: 500, statusText: 'Server error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Buchungen');
    fixture.nativeElement.querySelector('[aria-controls="create-accommodation"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#accommodation-name')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#accommodation-sext')).toBeTruthy();
    fixture.nativeElement.querySelector('.form-actions [type="button"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#create-accommodation')).toBeNull();
    requests.verify();
  });
});
