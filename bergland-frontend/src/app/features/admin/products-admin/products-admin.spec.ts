import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { ProductsAdmin } from './products-admin';

describe('ProductsAdmin', () => {
  let component: ProductsAdmin;
  let fixture: ComponentFixture<ProductsAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('keeps its heading in loading, error and empty states', () => {
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Produkte');
    component.loading = false;
    component.errorMessage = 'Testfehler';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('Testfehler');
    component.errorMessage = null;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('h1').textContent).toBe('Produkte');
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
  });

  it('opens and cancels the create form without submitting data', () => {
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/products').flush([]);
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('[aria-controls="create-product"]');
    expect(fixture.nativeElement.querySelector('#create-product')).toBeNull();
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('#product-name')).toBeTruthy();
    fixture.nativeElement.querySelector('.form-actions [type="button"]').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#create-product')).toBeNull();
    requests.verify();
  });

  it('resets pagination when searching and retains accessible editing actions', async () => {
    TestBed.inject(HttpTestingController).expectOne('/api/products').flush(
      Array.from({ length: 11 }, (_, index) => ({ id_produkt: String(index), produkt_name: `Produkt ${index}`, preis: 10, mwst_satz: 19 }))
    );
    component.page = 2;
    fixture.detectChanges();
    await fixture.whenStable();
    const search: HTMLInputElement = fixture.nativeElement.querySelector('#product-search');
    search.value = 'Produkt 0';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(component.page).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    fixture.nativeElement.querySelector('[aria-label="Produkt 0 bearbeiten"]').click();
    fixture.detectChanges();
    expect(component.editingProduct?.id_produkt).toBe('0');
    fixture.nativeElement.querySelector('[aria-label="Bearbeitung abbrechen"]').click();
    expect(component.editingProduct).toBeNull();
  });
});
