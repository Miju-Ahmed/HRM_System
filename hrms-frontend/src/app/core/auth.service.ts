import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface AuthUser { fullName: string; email: string; role: string; employeeId: number | null; token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl;
  private userSubject = new BehaviorSubject<AuthUser | null>(this.loadUser());
  user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  private loadUser(): AuthUser | null {
    try { return JSON.parse(localStorage.getItem('hrms_user') || 'null'); } catch { return null; }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/auth/login`, { email, password }).pipe(
      tap(res => {
        const user: AuthUser = { fullName: res.fullName, email: res.email, role: res.role, employeeId: res.employeeId, token: res.token };
        localStorage.setItem('hrms_user', JSON.stringify(user));
        this.userSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('hrms_user');
    this.userSubject.next(null);
    this.router.navigate(['/login']);
  }

  get currentUser(): AuthUser | null { return this.userSubject.value; }
  get token(): string | null { return this.currentUser?.token ?? null; }
  get isLoggedIn(): boolean { return !!this.currentUser; }
  get isAdmin(): boolean { return this.currentUser?.role === 'Admin'; }
  get isHR(): boolean { return this.currentUser?.role === 'HR'; }
  get isAdminOrHR(): boolean { return this.isAdmin || this.isHR; }

  changePassword(dto: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post(`${this.api}/auth/change-password`, dto);
  }
}
