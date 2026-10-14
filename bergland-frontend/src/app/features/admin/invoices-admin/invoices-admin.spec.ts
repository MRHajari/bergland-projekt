import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { InvoicesAdmin } from './invoices-admin';

describe('InvoicesAdmin', () => {
  let component: InvoicesAdmin;
  let fixture: ComponentFixture<InvoicesAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvoicesAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvoicesAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filters invoices and preserves the heading for an empty result', async () => {
    TestBed.inject(HttpTestingController).expectOne('/api/invoices?status=offen').flush([
      { id_rechnung: '1', rechnungs_nr: 'TEST-1', datum: '2026-10-01', betrag_gesamt: 10, ist_bezahlt: false }
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[title="PDF herunterladen"]')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[title="Als bezahlt markieren"]')).toBeTruthy();
    const search: HTMLInputElement = fixture.nativeElement.querySelector('#invoice-search');
    search.value = 'nicht vorhanden';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Rechnungen');
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('switches to the paid archive and clears stale errors while loading', async () => {
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/invoices?status=offen').flush([]);
    await fixture.whenStable();
    component.errorMessage.set('Vorheriger Fehler');
    fixture.detectChanges();
    fixture.nativeElement.querySelectorAll('.tabs button')[1].click();
    expect(component.errorMessage()).toBeNull();
    requests.expectOne('/api/invoices?status=bezahlt').flush([
      { id_rechnung: '1', rechnungs_nr: 'TEST-1', datum: '2026-10-01', betrag_gesamt: 10, ist_bezahlt: true }
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.tabs button')[1].getAttribute('aria-pressed')).toBe('true');
    expect(fixture.nativeElement.querySelector('#invoice-month')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[title="Als bezahlt markieren"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('.status.paid')).toBeTruthy();
    requests.verify();
  });

  it('downloads PDFs through HttpClient so the authentication interceptor can authorize them', () => {
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/invoices?status=offen').flush([]);
    spyOn(URL, 'createObjectURL').and.returnValue('blob:test-invoice');
    spyOn(URL, 'revokeObjectURL');
    spyOn(HTMLAnchorElement.prototype, 'click');
    component.printInvoice({ id_rechnung: '1', rechnungs_nr: 'TEST-1', datum: '', betrag_gesamt: 10, ist_bezahlt: false });
    const request = requests.expectOne('/api/invoices/1/pdf');
    expect(request.request.responseType).toBe('blob');
    request.flush(new Blob(['test'], { type: 'application/pdf' }));
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:test-invoice');
    requests.verify();
  });
});
