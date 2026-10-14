import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';

import { UsersAdmin } from './users-admin';

describe('UsersAdmin', () => {
  let component: UsersAdmin;
  let fixture: ComponentFixture<UsersAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows all supported roles and resets the page when filtering', async () => {
    TestBed.inject(HttpTestingController).expectOne('/api/users').flush([
      { id: '1', email: 'admin@example.test', role: 'admin' },
      { id: '2', email: 'user@example.test', role: 'user' },
      { id: '3', email: 'timer@example.test', role: 'timekeeper' }
    ]);
    component.pageSize = 1;
    component.page = 3;
    fixture.detectChanges();
    await fixture.whenStable();
    expect(component.filteredUsers.length).toBe(3);
    const filter: HTMLSelectElement = fixture.nativeElement.querySelector('#user-role-filter');
    filter.value = 'timekeeper';
    filter.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.page).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(fixture.nativeElement.querySelector('tbody').textContent).toContain('timer@example.test');
  });

  it('keeps role changes as drafts until saving succeeds', async () => {
    const requests = TestBed.inject(HttpTestingController);
    requests.expectOne('/api/users').flush([{ id: '1', email: 'user@example.test', role: 'user' }]);
    component.roleFilter = 'user';
    fixture.detectChanges();
    await fixture.whenStable();
    const select: HTMLSelectElement = fixture.nativeElement.querySelector('tbody select');
    const save: HTMLButtonElement = fixture.nativeElement.querySelector('tbody button.primary');
    expect(save.disabled).toBeTrue();
    select.value = 'admin';
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(component.users[0].role).toBe('user');
    expect(save.disabled).toBeFalse();
    spyOn(window, 'alert');
    save.click();
    const request = requests.expectOne('/api/users/1/role');
    expect(request.request.body).toEqual({ role: 'admin' });
    request.flush({});
    fixture.detectChanges();
    expect(component.users[0].role).toBe('admin');
    expect(component.pendingRoles['1']).toBeUndefined();
    expect(fixture.nativeElement.querySelector('.empty-state')).toBeTruthy();
    expect(component.totalPages).toBe(1);
    requests.verify();
  });
});
