import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

describe('authInterceptor', () => {
  let http: HttpClient;
  let requests: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([authInterceptor])),
      provideHttpClientTesting(), provideRouter([]),
    ] });
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    localStorage.setItem('accessToken', 'old-access');
    localStorage.setItem('refreshToken', 'old-refresh');
  });

  afterEach(() => {
    requests.verify();
    TestBed.inject(AuthService).clearSessionLocal();
  });

  it('never sends credentials to external origins', () => {
    http.get('https://example.com/api/products').subscribe();
    const request = requests.expectOne('https://example.com/api/products');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush([]);
  });

  it('shares a refresh and retries every waiting request', () => {
    let completed = 0;
    for (const path of ['persons', 'bookings']) {
      http.get(`${environment.apiUrl}/${path}`).subscribe(() => completed++);
      const request = requests.expectOne(`${environment.apiUrl}/${path}`);
      expect(request.request.headers.get('Authorization')).toBe('Bearer old-access');
      request.flush({}, { status: 401, statusText: 'Unauthorized' });
    }
    requests.expectOne(`${environment.apiUrl}/auth/refresh-token`).flush({ accessToken: 'new-access', refreshToken: 'new-refresh' });
    for (const path of ['persons', 'bookings']) {
      const request = requests.expectOne(`${environment.apiUrl}/${path}`);
      expect(request.request.headers.get('Authorization')).toBe('Bearer new-access');
      request.flush([]);
    }
    expect(completed).toBe(2);
  });

  it('terminates all waiting requests when refresh fails', () => {
    let errors = 0;
    for (const path of ['persons', 'bookings']) {
      http.get(`${environment.apiUrl}/${path}`).subscribe({ error: () => errors++ });
      requests.expectOne(`${environment.apiUrl}/${path}`).flush({}, { status: 401, statusText: 'Unauthorized' });
    }
    requests.expectOne(`${environment.apiUrl}/auth/refresh-token`).flush({}, { status: 403, statusText: 'Forbidden' });
    expect(errors).toBe(2);
    expect(localStorage.getItem('accessToken')).toBeNull();
  });

  it('does not log out after an unrelated error in a retried request', () => {
    http.get(`${environment.apiUrl}/persons`).subscribe({ error: () => {} });
    requests.expectOne(`${environment.apiUrl}/persons`).flush({}, { status: 401, statusText: 'Unauthorized' });
    requests.expectOne(`${environment.apiUrl}/auth/refresh-token`).flush({ accessToken: 'new-access' });
    requests.expectOne(`${environment.apiUrl}/persons`).flush({}, { status: 500, statusText: 'Server error' });
    expect(localStorage.getItem('accessToken')).toBe('new-access');
  });

  it('recovers from corrupt persisted user data', () => {
    localStorage.setItem('currentUser', '{');
    expect(TestBed.inject(AuthService).getCurrentUser()).toBeNull();
  });
});