import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});
