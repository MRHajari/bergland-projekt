import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AdminDashboard } from './admin-dashboard';

describe('AdminDashboard', () => {
  let component: AdminDashboard;
  let fixture: ComponentFixture<AdminDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('groups the six destinations into three labelled navigation sections', () => {
    const navigation: HTMLElement = fixture.nativeElement.querySelector('nav');
    expect(navigation.getAttribute('aria-label')).toBe('Verwaltungsbereiche');
    const groups = Array.from(navigation.querySelectorAll('section'));
    expect(groups.map(group => group.querySelector('h2')?.textContent?.trim())).toEqual([
      'Personen & Veranstaltungen', 'Unterbringung', 'Produkte & Abrechnung'
    ]);
    for (const group of groups) {
      expect(group.getAttribute('aria-labelledby')).toBe(group.querySelector('h2')?.id ?? null);
    }
    expect(navigation.querySelectorAll('a').length).toBe(6);
    expect(navigation.querySelectorAll('button').length).toBe(0);
  });

  it('preserves each destination and navigates through real links', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigateByUrl').and.resolveTo(true);
    const links = Array.from(fixture.nativeElement.querySelectorAll('nav a')) as HTMLAnchorElement[];
    const destinations = ['/admin/users', '/admin/events', '/admin/routes', '/admin/accommodations', '/admin/products', '/admin/invoices'];
    expect(links.map(link => link.getAttribute('href'))).toEqual(destinations);
    links.forEach((link, index) => {
      link.click();
      expect(navigate.calls.mostRecent().args[0].toString()).toBe(destinations[index]);
    });
  });
});
