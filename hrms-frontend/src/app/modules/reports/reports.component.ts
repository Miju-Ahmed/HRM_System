import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { EmployeeService, PayrollService, AttendanceService, LeaveService } from '../../core/services';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatFormFieldModule,
    MatSelectModule, MatTableModule, MatProgressSpinnerModule, MatSnackBarModule],
  template: `
    <div class="page-content fade-in-up">
      <div class="page-header">
        <div><h1>Reports</h1><div class="breadcrumb">Generate and export data reports</div></div>
      </div>

      <div class="reports-grid">
        <!-- Employee Report -->
        <div class="card report-card">
          <div class="report-icon accent"><mat-icon>people</mat-icon></div>
          <h3>Employee Report</h3>
          <p>Complete list of all employees with department and status information.</p>
          <div class="report-filters">
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="empFilter">
                <mat-option value="">All</mat-option>
                <mat-option value="Active">Active</mat-option>
                <mat-option value="Inactive">Inactive</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="report-actions">
            <button mat-raised-button class="btn-primary" (click)="exportEmployee('csv')" id="export-employee-csv"><mat-icon>download</mat-icon> Export CSV</button>
            <button mat-stroked-button (click)="previewEmployee()" id="preview-employee"><mat-icon>visibility</mat-icon> Preview</button>
          </div>
        </div>

        <!-- Payroll Report -->
        <div class="card report-card">
          <div class="report-icon success"><mat-icon>receipt_long</mat-icon></div>
          <h3>Payroll Report</h3>
          <p>Monthly payroll summary with salary breakdown, bonuses and deductions.</p>
          <div class="report-filters">
            <mat-form-field appearance="outline">
              <mat-label>Month</mat-label>
              <mat-select [(ngModel)]="payrollMonth">
                <mat-option *ngFor="let m of months; let i=index" [value]="i+1">{{m}}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Year</mat-label>
              <mat-select [(ngModel)]="payrollYear">
                <mat-option *ngFor="let y of years" [value]="y">{{y}}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="report-actions">
            <button mat-raised-button class="btn-primary" (click)="exportPayroll('csv')" id="export-payroll-csv"><mat-icon>download</mat-icon> Export CSV</button>
            <button mat-stroked-button (click)="previewPayroll()" id="preview-payroll"><mat-icon>visibility</mat-icon> Preview</button>
          </div>
        </div>

        <!-- Attendance Report -->
        <div class="card report-card">
          <div class="report-icon warning"><mat-icon>schedule</mat-icon></div>
          <h3>Attendance Report</h3>
          <p>Monthly attendance summary including working hours and overtime.</p>
          <div class="report-filters">
            <mat-form-field appearance="outline">
              <mat-label>Month</mat-label>
              <mat-select [(ngModel)]="attMonth">
                <mat-option *ngFor="let m of months; let i=index" [value]="i+1">{{m}}</mat-option>
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Year</mat-label>
              <mat-select [(ngModel)]="attYear">
                <mat-option *ngFor="let y of years" [value]="y">{{y}}</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="report-actions">
            <button mat-raised-button class="btn-primary" (click)="exportAttendance('csv')" id="export-attendance-csv"><mat-icon>download</mat-icon> Export CSV</button>
          </div>
        </div>

        <!-- Leave Report -->
        <div class="card report-card">
          <div class="report-icon info"><mat-icon>beach_access</mat-icon></div>
          <h3>Leave Report</h3>
          <p>Leave applications summary with approval status and leave types.</p>
          <div class="report-filters">
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="leaveStatusFilter">
                <mat-option value="">All</mat-option>
                <mat-option value="Pending">Pending</mat-option>
                <mat-option value="Approved">Approved</mat-option>
                <mat-option value="Rejected">Rejected</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
          <div class="report-actions">
            <button mat-raised-button class="btn-primary" (click)="exportLeave('csv')" id="export-leave-csv"><mat-icon>download</mat-icon> Export CSV</button>
          </div>
        </div>
      </div>

      <!-- Preview Table -->
      <div class="card" *ngIf="previewData.length > 0" style="margin-top:24px">
        <div class="card-header">
          <h3>{{previewTitle}}</h3>
          <button mat-icon-button (click)="previewData=[]"><mat-icon>close</mat-icon></button>
        </div>
        <div class="table-container">
          <table mat-table [dataSource]="previewData">
            <ng-container *ngFor="let col of previewCols" [matColumnDef]="col">
              <th mat-header-cell *matHeaderCellDef>{{col | titlecase}}</th>
              <td mat-cell *matCellDef="let row">{{row[col]}}</td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="previewCols"></tr>
            <tr mat-row *matRowDef="let r; columns: previewCols;"></tr>
          </table>
        </div>
      </div>
      <div *ngIf="loading" class="loading-overlay"><mat-spinner diameter="36"></mat-spinner></div>
    </div>
  `,
  styles: [`
    .reports-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
    .report-card { padding: 0; overflow: hidden; }
    .report-icon { width: 100%; height: 4px; }
    .report-icon.accent { background: linear-gradient(90deg, var(--accent), var(--accent-light)); }
    .report-icon.success { background: linear-gradient(90deg, var(--success), #34d399); }
    .report-icon.warning { background: linear-gradient(90deg, var(--warning), #fbbf24); }
    .report-icon.info { background: linear-gradient(90deg, var(--info), #60a5fa); }
    .report-card h3 { font-size: 16px; font-weight: 700; margin: 20px 20px 6px; }
    .report-card p { font-size: 13px; color: var(--text-muted); margin: 0 20px 16px; }
    .report-filters { padding: 0 20px; display: flex; gap: 12px; flex-wrap: wrap; mat-form-field { min-width: 130px; } }
    .report-actions { display: flex; gap: 10px; padding: 16px 20px; border-top: 1px solid var(--border); margin-top: 16px; }
  `]
})
export class ReportsComponent implements OnInit {
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  years = [2024, 2025, 2026];
  empFilter = '';
  payrollMonth = new Date().getMonth() + 1;
  payrollYear = new Date().getFullYear();
  attMonth = new Date().getMonth() + 1;
  attYear = new Date().getFullYear();
  leaveStatusFilter = '';
  loading = false;
  previewData: any[] = [];
  previewCols: string[] = [];
  previewTitle = '';

  constructor(private empSvc: EmployeeService, private payrollSvc: PayrollService, private attSvc: AttendanceService, private leaveSvc: LeaveService, private snack: MatSnackBar) {}
  ngOnInit() {}

  previewEmployee() {
    this.loading = true;
    this.empSvc.getAll({ status: this.empFilter, pageSize: 50 }).subscribe({
      next: (d: any) => {
        this.previewData = d.items.map((e: any) => ({ code: e.employeeCode, name: e.fullName, department: e.departmentName, designation: e.designationTitle, status: e.status, joining: new Date(e.joiningDate).toLocaleDateString() }));
        this.previewCols = ['code','name','department','designation','status','joining'];
        this.previewTitle = 'Employee Report Preview';
        this.loading = false;
      }, error: () => this.loading = false
    });
  }

  previewPayroll() {
    this.loading = true;
    this.payrollSvc.getAll({ month: this.payrollMonth, year: this.payrollYear }).subscribe({
      next: (d: any[]) => {
        this.previewData = d.map(p => ({ code: p.employeeCode, name: p.employeeName, department: p.departmentName, gross: '৳' + p.grossSalary.toFixed(0), bonus: '৳' + p.totalBonus.toFixed(0), net: '৳' + p.netSalary.toFixed(0), status: p.status }));
        this.previewCols = ['code','name','department','gross','bonus','net','status'];
        this.previewTitle = `Payroll Report - ${this.months[this.payrollMonth - 1]} ${this.payrollYear}`;
        this.loading = false;
      }, error: () => this.loading = false
    });
  }

  exportEmployee(format: string) { this.previewEmployee(); this.snack.open('Preview ready! Use browser print to save as PDF.', '×', { duration: 4000 }); }
  exportPayroll(format: string) { this.previewPayroll(); this.snack.open('Preview ready! Use browser print to save as PDF.', '×', { duration: 4000 }); }

  exportAttendance(format: string) {
    this.loading = true;
    this.attSvc.getAll({ month: this.attMonth, year: this.attYear }).subscribe({
      next: (d: any[]) => {
        this.previewData = d.map(a => ({ name: a.employeeName, date: new Date(a.date).toLocaleDateString(), checkIn: a.checkIn ? new Date(a.checkIn).toLocaleTimeString() : '—', checkOut: a.checkOut ? new Date(a.checkOut).toLocaleTimeString() : '—', hours: a.workingHours + 'h', status: a.status }));
        this.previewCols = ['name','date','checkIn','checkOut','hours','status'];
        this.previewTitle = `Attendance - ${this.months[this.attMonth - 1]} ${this.attYear}`;
        this.loading = false;
      }, error: () => this.loading = false
    });
  }

  exportLeave(format: string) {
    this.loading = true;
    const params: any = {};
    if (this.leaveStatusFilter) params.status = this.leaveStatusFilter;
    this.leaveSvc.getAll(params).subscribe({
      next: (d: any[]) => {
        this.previewData = d.map(l => ({ employee: l.employeeName, type: l.leaveTypeName, start: new Date(l.startDate).toLocaleDateString(), end: new Date(l.endDate).toLocaleDateString(), days: l.totalDays, status: l.status }));
        this.previewCols = ['employee','type','start','end','days','status'];
        this.previewTitle = 'Leave Report';
        this.loading = false;
      }, error: () => this.loading = false
    });
  }
}
