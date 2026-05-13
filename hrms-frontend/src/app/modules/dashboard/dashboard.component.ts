import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { AuthService } from '../../core/auth.service';
import { DashboardService } from '../../core/services';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatProgressSpinnerModule, BaseChartDirective],
  template: `
    <div class="page-content fade-in-up">
      
      <!-- ================= ADMIN DASHBOARD ================= -->
      <ng-container *ngIf="auth.isAdmin && adminSummary && adminCharts">
        <div class="page-header">
          <div><h1>Admin Dashboard</h1><div class="breadcrumb">Complete system overview</div></div>
          <span class="badge badge-success">● Live</span>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card accent" routerLink="/employees">
            <div class="stat-label">Total Employees</div>
            <div class="stat-value">{{adminSummary.totalEmployees}}</div>
            <div class="stat-sub">{{adminSummary.activeEmployees}} active, {{adminSummary.newEmployeesThisMonth}} new this month</div>
            <mat-icon class="stat-icon">people</mat-icon>
          </div>
          <div class="stat-card info" routerLink="/departments">
            <div class="stat-label">Departments</div>
            <div class="stat-value">{{adminSummary.totalDepartments}}</div>
            <div class="stat-sub">Across organization</div>
            <mat-icon class="stat-icon">business</mat-icon>
          </div>
          <div class="stat-card success" routerLink="/payroll">
            <div class="stat-label">Monthly Payroll</div>
            <div class="stat-value">৳{{adminSummary.totalPayrollThisMonth | number:'1.0-0'}}</div>
            <div class="stat-sub">This month expense</div>
            <mat-icon class="stat-icon">payments</mat-icon>
          </div>
          <div class="stat-card warning" routerLink="/leave">
            <div class="stat-label">Pending Leaves</div>
            <div class="stat-value">{{adminSummary.totalPendingLeaves}}</div>
            <div class="stat-sub">Awaiting approval</div>
            <mat-icon class="stat-icon">beach_access</mat-icon>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header"><h3>Monthly Payroll Trend</h3></div>
            <div class="chart-container">
              <canvas baseChart [data]="adminPayrollChartData" [options]="chartOptions" type="line"></canvas>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Department Headcount</h3></div>
            <div class="chart-container">
              <canvas baseChart [data]="adminDeptChartData" [options]="chartOptions" type="bar"></canvas>
            </div>
          </div>
        </div>

        <div class="dashboard-grid mt-4">
          <div class="card">
            <div class="card-header"><h3>Recent Activities</h3></div>
            <div class="recent-list">
              <div *ngFor="let a of adminActivities" class="recent-item">
                <div><strong>{{a.description}}</strong></div>
                <span class="badge badge-info">{{a.timestamp | date:'MMM d, shortTime'}}</span>
              </div>
              <div *ngIf="!adminActivities?.length" class="empty-mini">No recent activities</div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>System Notifications</h3></div>
            <div class="recent-list">
              <div *ngFor="let n of adminNotifications" class="recent-item">
                <div><strong>{{n.title}}</strong><br/><span class="text-muted">{{n.message}}</span></div>
                <span class="badge" [ngClass]="n.type === 'Warning' ? 'badge-warning' : 'badge-info'">{{n.type}}</span>
              </div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ================= HR DASHBOARD ================= -->
      <ng-container *ngIf="auth.isHR && !auth.isAdmin && hrSummary && hrCharts">
        <div class="page-header">
          <div><h1>HR Dashboard</h1><div class="breadcrumb">Human Resource Operations</div></div>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card accent">
            <div class="stat-label">Active Employees</div>
            <div class="stat-value">{{hrSummary.activeEmployees}}</div>
            <div class="stat-sub">{{hrSummary.newJoiners}} new joiners this month</div>
            <mat-icon class="stat-icon">groups</mat-icon>
          </div>
          <div class="stat-card success">
            <div class="stat-label">Today's Attendance</div>
            <div class="stat-value">{{hrSummary.todayAttendance}}</div>
            <div class="stat-sub">Present or Late</div>
            <mat-icon class="stat-icon">how_to_reg</mat-icon>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">Pending Leaves</div>
            <div class="stat-value">{{hrSummary.pendingLeaves}}</div>
            <div class="stat-sub">{{hrSummary.employeesOnLeaveToday}} on leave today</div>
            <mat-icon class="stat-icon">event_busy</mat-icon>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header"><h3>Today's Attendance Overview</h3></div>
            <div class="chart-container pie-container">
              <canvas baseChart [data]="hrAttendanceChartData" [options]="pieChartOptions" type="doughnut"></canvas>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>HR Tasks & Alerts</h3></div>
            <div class="recent-list">
              <div *ngFor="let t of hrTasks" class="recent-item">
                <div><strong>{{t.taskName}}</strong></div>
                <a mat-button color="primary" [routerLink]="t.actionLink">Action</a>
              </div>
              <div *ngIf="!hrTasks?.length" class="empty-mini">No pending HR tasks!</div>
            </div>
          </div>
        </div>
      </ng-container>

      <!-- ================= EMPLOYEE DASHBOARD ================= -->
      <ng-container *ngIf="!auth.isAdminOrHR && empSummary && empSalary">
        <div class="page-header">
          <div><h1>My Dashboard</h1><div class="breadcrumb">Welcome back, {{empSummary.profile?.fullName}}</div></div>
          <div class="attendance-status">
            <button mat-raised-button class="btn-primary" routerLink="/attendance">
              <mat-icon>schedule</mat-icon> Go to Attendance
            </button>
          </div>
        </div>

        <div class="stats-grid">
          <div class="stat-card accent">
            <div class="stat-label">Current Net Salary</div>
            <div class="stat-value" style="font-size:24px">৳{{empSalary.net | number:'1.0-0'}}</div>
            <div class="stat-sub">Basic: ৳{{empSalary.basic | number:'1.0-0'}}</div>
            <mat-icon class="stat-icon">payments</mat-icon>
          </div>
          <div class="stat-card info">
            <div class="stat-label">Leave Balance</div>
            <div class="stat-value">{{empSummary.leaveBalance}} days</div>
            <div class="stat-sub">{{empSummary.pendingLeaves}} pending requests</div>
            <mat-icon class="stat-icon">beach_access</mat-icon>
          </div>
          <div class="stat-card success">
            <div class="stat-label">Attendance This Month</div>
            <div class="stat-value">{{empAttendance?.presentDays}}</div>
            <div class="stat-sub">{{empAttendance?.lateDays}} late, {{empAttendance?.absentDays}} absent</div>
            <mat-icon class="stat-icon">check_circle</mat-icon>
          </div>
        </div>

        <div class="dashboard-grid">
          <div class="card">
            <div class="card-header"><h3>Recent Payslips</h3><a mat-button routerLink="/payroll">View All</a></div>
            <div class="recent-list">
              <div *ngFor="let p of empSalary.recentPayslips" class="recent-item">
                <div><strong>{{months[p.month-1]}} {{p.year}}</strong></div>
                <span class="badge badge-success">৳{{p.netSalary | number:'1.0-0'}}</span>
                <span class="badge badge-info">{{p.status}}</span>
              </div>
              <div *ngIf="!empSalary.recentPayslips?.length" class="empty-mini">No payslips yet</div>
            </div>
          </div>
          <div class="card">
            <div class="card-header"><h3>Recent Leave Applications</h3><a mat-button routerLink="/leave">View All</a></div>
            <div class="recent-list">
              <div *ngFor="let l of empLeave?.history" class="recent-item">
                <div><strong>{{l.leaveTypeName}}</strong><br/><span class="text-muted">{{l.startDate | date}} to {{l.endDate | date}} ({{l.totalDays}} days)</span></div>
                <span class="badge" [ngClass]="l.status === 'Approved' ? 'badge-success' : l.status === 'Pending' ? 'badge-warning' : 'badge-danger'">{{l.status}}</span>
              </div>
              <div *ngIf="!empLeave?.history?.length" class="empty-mini">No leave history</div>
            </div>
          </div>
        </div>
      </ng-container>

      <div *ngIf="loading" class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div>
      <div *ngIf="apiError" class="error-overlay">
        <mat-icon color="warn" style="font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px;">error_outline</mat-icon>
        <h2>Failed to load dashboard</h2>
        <p>The system encountered an error while fetching your dashboard data. Please try again later.</p>
        <button mat-raised-button color="primary" (click)="ngOnInit()">Retry</button>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .mt-4 { margin-top: 20px; }
    .chart-container { padding: 20px; height: 300px; display: flex; justify-content: center; }
    .pie-container { height: 250px; }
    .recent-list { padding: 8px 0; }
    .recent-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 20px; border-bottom: 1px solid var(--border); font-size: 13px; &:last-child { border-bottom: none; } }
    .text-muted { color: var(--text-muted); font-size: 12px; }
    .empty-mini { padding: 20px; text-align: center; color: var(--text-muted); font-size: 13px; }
    .attendance-status { display: flex; align-items: center; }
    .error-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: rgba(15, 23, 42, 0.9); z-index: 1000; text-align: center; border-radius: 12px; }
    @media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; } }
  `]
})
export class DashboardComponent implements OnInit {
  loading = true;
  apiError = false;
  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Admin Data
  adminSummary: any; adminCharts: any; adminActivities: any; adminNotifications: any;
  adminPayrollChartData: ChartConfiguration<'line'>['data'] = { datasets: [], labels: [] };
  adminDeptChartData: ChartConfiguration<'bar'>['data'] = { datasets: [], labels: [] };

  // HR Data
  hrSummary: any; hrCharts: any; hrTasks: any;
  hrAttendanceChartData: ChartConfiguration<'doughnut'>['data'] = { datasets: [], labels: [] };

  // Employee Data
  empSummary: any; empAttendance: any; empSalary: any; empLeave: any;

  // Chart Options
  chartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { 
      y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
      x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
    }
  };
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: 'right', labels: { color: '#94a3b8' } } }
  };

  constructor(public auth: AuthService, private dashSvc: DashboardService) {}

  ngOnInit() {
    this.loading = true;
    this.apiError = false;
    
    if (this.auth.isAdmin) {
      forkJoin({
        summary: this.dashSvc.getAdminSummary(),
        charts: this.dashSvc.getAdminCharts(),
        activities: this.dashSvc.getAdminActivities(),
        notifications: this.dashSvc.getAdminNotifications()
      }).subscribe({
        next: (data: any) => {
          this.adminSummary = data.summary;
          this.adminCharts = data.charts;
          this.adminActivities = data.activities;
          this.adminNotifications = data.notifications;
          
          this.adminPayrollChartData = {
            labels: this.adminCharts.payrollTrend.map((t:any) => this.months[parseInt(t.month)-1]),
            datasets: [{ data: this.adminCharts.payrollTrend.map((t:any) => t.total), label: 'Payroll Expense', borderColor: '#6366f1', backgroundColor: 'rgba(99,102,241,0.2)', fill: true, tension: 0.4 }]
          };

          this.adminDeptChartData = {
            labels: this.adminCharts.employeesByDepartment.map((d:any) => d.dept),
            datasets: [{ data: this.adminCharts.employeesByDepartment.map((d:any) => d.count), label: 'Headcount', backgroundColor: '#10b981' }]
          };

          this.loading = false;
        },
        error: (err) => { console.error('Dashboard Error:', err); this.apiError = true; this.loading = false; }
      });
    } else if (this.auth.isHR) {
      forkJoin({
        summary: this.dashSvc.getHrSummary(),
        charts: this.dashSvc.getHrCharts(),
        tasks: this.dashSvc.getHrTasks()
      }).subscribe({
        next: (data: any) => {
          this.hrSummary = data.summary;
          this.hrCharts = data.charts;
          this.hrTasks = data.tasks;

          this.hrAttendanceChartData = {
            labels: this.hrCharts.attendanceSummary.map((a:any) => a.status),
            datasets: [{ data: this.hrCharts.attendanceSummary.map((a:any) => a.count), backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444'] }]
          };

          this.loading = false;
        },
        error: (err) => { console.error('Dashboard Error:', err); this.apiError = true; this.loading = false; }
      });
    } else {
      forkJoin({
        summary: this.dashSvc.getEmpSummary(),
        attendance: this.dashSvc.getEmpAttendance(),
        salary: this.dashSvc.getEmpSalary(),
        leave: this.dashSvc.getEmpLeave()
      }).subscribe({
        next: (data: any) => {
          this.empSummary = data.summary;
          this.empAttendance = data.attendance;
          this.empSalary = data.salary;
          this.empLeave = data.leave;
          this.loading = false;
        },
        error: (err) => { console.error('Dashboard Error:', err); this.apiError = true; this.loading = false; }
      });
    }
  }
}
