import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private api = `${environment.apiUrl}/employees`;
  constructor(private http: HttpClient) {}

  getAll(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k] !== null && params[k] !== '') p = p.set(k, params[k]); });
    return this.http.get(this.api, { params: p });
  }
  getById(id: number): Observable<any> { return this.http.get(`${this.api}/${id}`); }
  create(dto: any): Observable<any> { return this.http.post(this.api, dto); }
  update(id: number, dto: any): Observable<any> { return this.http.put(`${this.api}/${id}`, dto); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.api}/${id}`); }
  getStats(): Observable<any> { return this.http.get(`${this.api}/stats`); }
  uploadPhoto(id: number, file: File): Observable<any> {
    const fd = new FormData(); fd.append('file', file);
    return this.http.post(`${this.api}/${id}/upload-photo`, fd);
  }
}

@Injectable({ providedIn: 'root' })
export class DepartmentService {
  private api = `${environment.apiUrl}/departments`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<any> { return this.http.get(this.api); }
  getById(id: number): Observable<any> { return this.http.get(`${this.api}/${id}`); }
  create(dto: any): Observable<any> { return this.http.post(this.api, dto); }
  update(id: number, dto: any): Observable<any> { return this.http.put(`${this.api}/${id}`, dto); }
  delete(id: number): Observable<any> { return this.http.delete(`${this.api}/${id}`); }
  getDesignations(departmentId?: number): Observable<any> {
    let p = new HttpParams();
    if (departmentId) p = p.set('departmentId', departmentId);
    return this.http.get(`${this.api}/designations`, { params: p });
  }
  createDesignation(dto: any): Observable<any> { return this.http.post(`${this.api}/designations`, dto); }
  updateDesignation(id: number, dto: any): Observable<any> { return this.http.put(`${this.api}/designations/${id}`, dto); }
  deleteDesignation(id: number): Observable<any> { return this.http.delete(`${this.api}/designations/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class SalaryService {
  private api = `${environment.apiUrl}/salary`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<any> { return this.http.get(this.api); }
  getByEmployee(employeeId: number): Observable<any> { return this.http.get(`${this.api}/${employeeId}`); }
  setSalary(employeeId: number, dto: any): Observable<any> { return this.http.post(`${this.api}/${employeeId}`, dto); }
  addBonus(employeeId: number, dto: any): Observable<any> { return this.http.post(`${this.api}/${employeeId}/bonus`, dto); }
  deleteBonus(id: number): Observable<any> { return this.http.delete(`${this.api}/bonus/${id}`); }
  addDeduction(employeeId: number, dto: any): Observable<any> { return this.http.post(`${this.api}/${employeeId}/deduction`, dto); }
  deleteDeduction(id: number): Observable<any> { return this.http.delete(`${this.api}/deduction/${id}`); }
}

@Injectable({ providedIn: 'root' })
export class PayrollService {
  private api = `${environment.apiUrl}/payroll`;
  constructor(private http: HttpClient) {}
  getAll(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k] !== null && params[k] !== undefined) p = p.set(k, params[k]); });
    return this.http.get(this.api, { params: p });
  }
  generate(dto: any): Observable<any> { return this.http.post(`${this.api}/generate`, dto); }
  approve(id: number): Observable<any> { return this.http.put(`${this.api}/${id}/approve`, {}); }
  markPaid(id: number): Observable<any> { return this.http.put(`${this.api}/${id}/mark-paid`, {}); }
  getPayslip(id: number): Observable<any> { return this.http.get(`${this.api}/${id}/payslip`); }
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private api = `${environment.apiUrl}/attendance`;
  constructor(private http: HttpClient) {}
  getAll(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get(this.api, { params: p });
  }
  checkIn(dto: any): Observable<any> { return this.http.post(`${this.api}/check-in`, dto); }
  checkOut(dto: any): Observable<any> { return this.http.post(`${this.api}/check-out`, dto); }
  getToday(): Observable<any> { return this.http.get(`${this.api}/today`); }
  getMonthlySummary(employeeId: number, month: number, year: number): Observable<any> {
    return this.http.get(`${this.api}/summary/${employeeId}`, { params: new HttpParams().set('month', month).set('year', year) });
  }
}

@Injectable({ providedIn: 'root' })
export class LeaveService {
  private api = `${environment.apiUrl}/leave`;
  constructor(private http: HttpClient) {}
  getTypes(): Observable<any> { return this.http.get(`${this.api}/types`); }
  getAll(params?: any): Observable<any> {
    let p = new HttpParams();
    if (params) Object.keys(params).forEach(k => { if (params[k]) p = p.set(k, params[k]); });
    return this.http.get(this.api, { params: p });
  }
  apply(dto: any): Observable<any> { return this.http.post(this.api, dto); }
  review(id: number, dto: any): Observable<any> { return this.http.put(`${this.api}/${id}/review`, dto); }
  getBalance(employeeId: number, year?: number): Observable<any> {
    let p = new HttpParams();
    if (year) p = p.set('year', year);
    return this.http.get(`${this.api}/balance/${employeeId}`, { params: p });
  }
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private api = `${environment.apiUrl}/dashboard`;
  constructor(private http: HttpClient) {}
  
  getAdminSummary(): Observable<any> { return this.http.get(`${this.api}/admin/summary`); }
  getAdminCharts(): Observable<any> { return this.http.get(`${this.api}/admin/charts`); }
  getAdminActivities(): Observable<any> { return this.http.get(`${this.api}/admin/activities`); }
  getAdminNotifications(): Observable<any> { return this.http.get(`${this.api}/admin/notifications`); }

  getHrSummary(): Observable<any> { return this.http.get(`${this.api}/hr/summary`); }
  getHrCharts(): Observable<any> { return this.http.get(`${this.api}/hr/charts`); }
  getHrTasks(): Observable<any> { return this.http.get(`${this.api}/hr/tasks`); }

  getEmpSummary(): Observable<any> { return this.http.get(`${this.api}/employee/summary`); }
  getEmpAttendance(): Observable<any> { return this.http.get(`${this.api}/employee/attendance`); }
  getEmpSalary(): Observable<any> { return this.http.get(`${this.api}/employee/salary`); }
  getEmpLeave(): Observable<any> { return this.http.get(`${this.api}/employee/leave`); }
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = `${environment.apiUrl}/notifications`;
  constructor(private http: HttpClient) {}
  getAll(): Observable<any> { return this.http.get(this.api); }
  getUnreadCount(): Observable<any> { return this.http.get(`${this.api}/unread-count`); }
  markRead(id: number): Observable<any> { return this.http.put(`${this.api}/${id}/read`, {}); }
  markAllRead(): Observable<any> { return this.http.put(`${this.api}/mark-all-read`, {}); }
}
