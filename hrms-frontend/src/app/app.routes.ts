import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./modules/auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./modules/shell/shell.component').then(m => m.ShellComponent),
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', loadComponent: () => import('./modules/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'employees', loadComponent: () => import('./modules/employees/employee-list/employee-list.component').then(m => m.EmployeeListComponent) },
      { path: 'employees/:id', loadComponent: () => import('./modules/employees/employee-detail/employee-detail.component').then(m => m.EmployeeDetailComponent) },
      { path: 'departments', loadComponent: () => import('./modules/departments/departments.component').then(m => m.DepartmentsComponent) },
      { path: 'salary', loadComponent: () => import('./modules/salary/salary-list/salary-list.component').then(m => m.SalaryListComponent) },
      { path: 'salary/:id', loadComponent: () => import('./modules/salary/salary-detail/salary-detail.component').then(m => m.SalaryDetailComponent) },
      { path: 'payroll', loadComponent: () => import('./modules/payroll/payroll.component').then(m => m.PayrollComponent) },
      { path: 'attendance', loadComponent: () => import('./modules/attendance/attendance.component').then(m => m.AttendanceComponent) },
      { path: 'leave', loadComponent: () => import('./modules/leave/leave.component').then(m => m.LeaveComponent) },
      { path: 'reports', loadComponent: () => import('./modules/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'settings', loadComponent: () => import('./modules/settings/settings.component').then(m => m.SettingsComponent) },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
