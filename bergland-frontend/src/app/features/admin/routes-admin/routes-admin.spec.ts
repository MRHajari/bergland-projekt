import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { RoutesAdmin } from './routes-admin';

describe('RoutesAdmin', () => {
  let component: RoutesAdmin;
  let fixture: ComponentFixture<RoutesAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoutesAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoutesAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggles the create form without changing data', () => {
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/routes').flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#create-route')).toBeNull();
    fixture.nativeElement.querySelector('[aria-controls="create-route"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#route-name')).toBeTruthy();
    fixture.nativeElement.querySelector('.form-actions [type="button"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#create-route')).toBeNull();
    requests.verify();
  });

  it('resets pagination on search and keeps row editing available', async () => {
    TestBed.inject(HttpTestingController).expectOne('/api/routes').flush(
      Array.from({ length: 11 }, (_, index) => ({ id: String(index), name: `Strecke ${index}`, length_km: 10, elevation_m: 100 }))
    );
    component.page = 2;
    fixture.detectChanges();
    await fixture.whenStable();
    const search: HTMLInputElement = fixture.nativeElement.querySelector('#route-search');
    search.value = 'Strecke 0';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.page).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    fixture.nativeElement.querySelector('[aria-label="Strecke 0 bearbeiten"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Strecke speichern"]')).toBeTruthy();
    fixture.nativeElement.querySelector('[aria-label="Bearbeitung abbrechen"]').click();
    expect(component.editingRoute).toBeNull();
  });
});
