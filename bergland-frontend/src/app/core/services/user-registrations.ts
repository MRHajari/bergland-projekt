// frontend/src/app/core/services/user-registration.service.ts
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class UserRegistrationService {
  private endpoint = 'user-registrations'; // ✅ korrektes Backend-Endpoint

  constructor(private api: ApiService) {}

  getAll(): Observable<any[]> {
    return this.api.get<any[]>(this.endpoint).pipe(
      catchError(err => throwError(() => err))
    );
  }

  getById(id: string): Observable<any> {
    return this.api.getById(this.endpoint, id).pipe(
      catchError(err => throwError(() => err))
    );
  }

  create(data: any): Observable<any> {
    return this.api.post(this.endpoint, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  update(id: string, data: any): Observable<any> {
    return this.api.put(this.endpoint, id, data).pipe(
      catchError(err => throwError(() => err))
    );
  }

  delete(id: string): Observable<any> {
    return this.api.delete(this.endpoint, id).pipe(
      catchError(err => throwError(() => err))
    );
  }
}
