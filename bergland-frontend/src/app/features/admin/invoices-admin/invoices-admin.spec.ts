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
