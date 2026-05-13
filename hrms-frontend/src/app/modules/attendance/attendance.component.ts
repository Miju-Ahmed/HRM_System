import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AttendanceService, EmployeeService } from '../../core/services';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-attendance',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatInputModule, MatTableModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-content fade-in-up">
      <div class="page-header">
        <div><h1>Attendance</h1><div class="breadcrumb">Track employee attendance</div></div>
        <div style="display:flex;gap:10px" *ngIf="!auth.isAdminOrHR && empId">
          <button mat-raised-button class="btn-primary" (click)="checkIn()" [disabled]="todayStatus!==0" id="checkin-btn">
            <mat-icon>login</mat-icon> Check In
          </button>
          <button mat-raised-button color="warn" (click)="checkOut()" [disabled]="todayStatus!==1" id="checkout-btn">
            <mat-icon>logout</mat-icon> Check Out
          </button>
        </div>
      </div>

      <!-- Today's Status Card -->
      <div class="stats-grid" *ngIf="todaySummary">
        <div class="stat-card success"><div class="stat-label">Present Today</div><div class="stat-value">{{todaySummary.present}}</div><mat-icon class="stat-icon">check_circle</mat-icon></div>
        <div class="stat-card danger"><div class="stat-label">Absent Today</div><div class="stat-value">{{todaySummary.absent}}</div><mat-icon class="stat-icon">cancel</mat-icon></div>
        <div class="stat-card warning"><div class="stat-label">Late Today</div><div class="stat-value">{{todaySummary.late}}</div><mat-icon class="stat-icon">schedule</mat-icon></div>
      </div>

      <!-- Filter Bar -->
      <div class="card">
        <div class="search-bar">
          <mat-form-field appearance="outline" *ngIf="auth.isAdminOrHR" style="min-width:220px">
            <mat-label>Employee</mat-label>
            <mat-select [(ngModel)]="filterEmpId" (ngModelChange)="load()">
              <mat-option [value]="null">All Employees</mat-option>
              <mat-option *ngFor="let e of employees" [value]="e.id">{{e.fullName}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="min-width:140px">
            <mat-label>Month</mat-label>
            <mat-select [(ngModel)]="filterMonth" (ngModelChange)="load()">
              <mat-option *ngFor="let m of months; let i=index" [value]="i+1">{{m}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="min-width:120px">
            <mat-label>Year</mat-label>
            <mat-select [(ngModel)]="filterYear" (ngModelChange)="load()">
              <mat-option *ngFor="let y of years" [value]="y">{{y}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>

        <div class="table-container" *ngIf="!loading; else spinner">
          <table mat-table [dataSource]="records">
            <ng-container matColumnDef="employee"><th mat-header-cell *matHeaderCellDef>Employee</th><td mat-cell *matCellDef="let a">{{a.employeeName}}</td></ng-container>
            <ng-container matColumnDef="date"><th mat-header-cell *matHeaderCellDef>Date</th><td mat-cell *matCellDef="let a">{{a.date | date:'EEE, MMM d'}}</td></ng-container>
            <ng-container matColumnDef="checkIn"><th mat-header-cell *matHeaderCellDef>Check In</th><td mat-cell *matCellDef="let a">{{a.checkIn ? (a.checkIn | date:'shortTime') : '—'}}</td></ng-container>
            <ng-container matColumnDef="checkOut"><th mat-header-cell *matHeaderCellDef>Check Out</th><td mat-cell *matCellDef="let a">{{a.checkOut ? (a.checkOut | date:'shortTime') : '—'}}</td></ng-container>
            <ng-container matColumnDef="hours"><th mat-header-cell *matHeaderCellDef>Hours</th><td mat-cell *matCellDef="let a">{{a.workingHours}}h <span *ngIf="a.overtimeHours>0" style="color:var(--success)">(+{{a.overtimeHours}}h OT)</span></td></ng-container>
            <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <span class="badge" [ngClass]="attClass(a.status)">{{a.status}}</span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols;"></tr>
          </table>
          <div *ngIf="records.length===0" class="empty-state"><mat-icon>schedule</mat-icon><h3>No attendance records</h3></div>
        </div>
        <ng-template #spinner><div class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div></ng-template>
      </div>
    </div>
  `
})
export class AttendanceComponent implements OnInit {
  records: any[] = [];
  employees: any[] = [];
  loading = false;
  todayStatus = 0;
  todaySummary: any = null;
  filterEmpId: number | null = null;
  filterMonth = new Date().getMonth() + 1;
  filterYear = new Date().getFullYear();
  empId: number | null = null;
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  years = [2024, 2025, 2026];
  cols = ['employee','date','checkIn','checkOut','hours','status'];

  constructor(public auth: AuthService, private attSvc: AttendanceService, private empSvc: EmployeeService, private snack: MatSnackBar) {}

  ngOnInit() {
    if (!this.auth.isAdminOrHR) {
      this.empId = this.auth.currentUser?.employeeId ?? null;
      this.filterEmpId = this.empId;
      this.cols = ['date','checkIn','checkOut','hours','status'];
    } else {
      this.empSvc.getAll({ pageSize: 100 }).subscribe({ next: (d: any) => this.employees = d.items });
      this.loadTodaySummary();
    }
    this.load();
  }

  load() {
    this.loading = true;
    const params: any = { month: this.filterMonth, year: this.filterYear };
    if (this.filterEmpId) params.employeeId = this.filterEmpId;
    this.attSvc.getAll(params).subscribe({ next: d => { this.records = d; this.loading = false; this.checkTodayStatus(); }, error: () => this.loading = false });
  }

  loadTodaySummary() {
    this.attSvc.getToday().subscribe({ next: (d: any[]) => {
      this.todaySummary = { present: d.filter(a => a.status==='Present').length, absent: 0, late: d.filter(a => a.status==='Late').length };
    }});
  }

  checkTodayStatus() {
    const today = new Date().toDateString();
    const todayRec = this.records.find(r => new Date(r.date).toDateString() === today);
    this.todayStatus = todayRec ? (todayRec.checkOut ? 2 : 1) : 0;
  }

  checkIn() {
    if (!this.empId) return;
    this.attSvc.checkIn({ employeeId: this.empId }).subscribe({ next: (r: any) => { this.snack.open(r.message || 'Checked in!', '×', { duration: 3000 }); this.load(); }, error: (e: any) => this.snack.open(e?.error?.message || 'Error', '×', { duration: 3000 }) });
  }

  checkOut() {
    if (!this.empId) return;
    this.attSvc.checkOut({ employeeId: this.empId }).subscribe({ next: (r: any) => { this.snack.open(r.message || 'Checked out!', '×', { duration: 3000 }); this.load(); }, error: (e: any) => this.snack.open(e?.error?.message || 'Error', '×', { duration: 3000 }) });
  }

  attClass(s: string) { return { 'badge-success': s==='Present', 'badge-warning': s==='Late', 'badge-danger': s==='Absent', 'badge-muted': s==='OnLeave', 'badge-info': s==='HalfDay' }; }
}
