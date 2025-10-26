import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsOrder } from './products-order';

describe('ProductsOrder', () => {
  let component: ProductsOrder;
  let fixture: ComponentFixture<ProductsOrder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsOrder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsOrder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
