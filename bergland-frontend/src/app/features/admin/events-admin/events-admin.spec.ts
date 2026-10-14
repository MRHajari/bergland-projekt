import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { EventsAdmin } from './events-admin';

describe('EventsAdmin', () => {
  let component: EventsAdmin;
  let fixture: ComponentFixture<EventsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventsAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventsAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('resets search pagination while retaining all event actions', async () => {
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/events').flush(
      Array.from({ length: 9 }, (_, index) => ({ id: String(index), name: `Event ${index}`, start_date: '2026-10-20', end_date: '2026-10-22' }))
    );
    requests.expectOne('/api/event-registrations/count-by-event').flush([]);
    component.page = 2;
    fixture.detectChanges();
    await fixture.whenStable();
    const search: HTMLInputElement = fixture.nativeElement.querySelector('#event-search');
    search.value = 'Event 0';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.page).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('tbody button').length).toBe(5);
    const registrations = spyOn(component, 'viewRegistrations');
    fixture.nativeElement.querySelector('[title="Anmeldungen anzeigen"]').click();
    expect(registrations).toHaveBeenCalledWith('0');
    requests.verify();
  });

  it('opens the create form and cancels without submitting', () => {
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/events').flush([]);
    requests.expectOne('/api/event-registrations/count-by-event').flush([]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('[aria-controls="create-event"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#event-deadline')).toBeTruthy();
    fixture.nativeElement.querySelector('.form-actions [type="button"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#create-event')).toBeNull();
    requests.verify();
  });

  it('keeps route date and start time controls in a labelled dismissible dialog', () => {
    component.routes = [{ id: 'route-1', name: 'Berglandrunde', length_km: 12, elevation_m: 300 }];
    component.selectedRouteEventId = 'event-1';
    component.eventRoutesMap = { 'route-1': { assigned: true, day_date: '2026-10-20', start_time: '09:30' } };
    component.showRouteModal = true;
    fixture.detectChanges();
    const dialog: HTMLElement = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.getAttribute('aria-labelledby')).toBe('route-dialog-title');
    const time = dialog.querySelector('input[type="time"]') as HTMLInputElement;
    expect(time.value).toBe('09:30');
    time.value = '10:00';
    time.dispatchEvent(new Event('input'));
    expect(component.getRouteAssignment('route-1').start_time).toBe('10:00');
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });
});
