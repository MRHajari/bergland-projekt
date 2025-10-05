import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesAdmin } from './invoices-admin';

describe('InvoiceAdmin', () => {
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
});
