import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeService, DepartmentService } from '../../../core/services';
import { AuthService } from '../../../core/auth.service';
import { EmployeeFormDialogComponent } from '../employee-form-dialog/employee-form-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-employee-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, MatTableModule,
    MatPaginatorModule, MatSortModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule, MatChipsModule,
    MatTooltipModule, MatProgressSpinnerModule],
  template: `
    <div class="page-content fade-in-up">
      <div class="page-header">
        <div><h1>Employee Management</h1><div class="breadcrumb">Manage all employee records</div></div>
        <button *ngIf="auth.isAdminOrHR" mat-raised-button class="btn-primary" (click)="openForm()" id="add-employee-btn">
          <mat-icon>person_add</mat-icon> Add Employee
        </button>
      </div>

      <div class="card">
        <div class="search-bar">
          <mat-form-field appearance="outline" style="min-width:240px">
            <mat-label>Search employees...</mat-label>
            <input matInput [(ngModel)]="filters.search" (ngModelChange)="onSearch()" id="search-input">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline" style="min-width:160px">
            <mat-label>Department</mat-label>
            <mat-select [(ngModel)]="filters.departmentId" (ngModelChange)="load()">
              <mat-option [value]="null">All Departments</mat-option>
              <mat-option *ngFor="let d of departments" [value]="d.id">{{d.name}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="min-width:140px">
            <mat-label>Status</mat-label>
            <mat-select [(ngModel)]="filters.status" (ngModelChange)="load()">
              <mat-option value="">All Status</mat-option>
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
              <mat-option value="Resigned">Resigned</mat-option>
              <mat-option value="Terminated">Terminated</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline" style="min-width:120px">
            <mat-label>Gender</mat-label>
            <mat-select [(ngModel)]="filters.gender" (ngModelChange)="load()">
              <mat-option value="">All</mat-option>
              <mat-option value="Male">Male</mat-option>
              <mat-option value="Female">Female</mat-option>
            </mat-select>
          </mat-form-field>
          <span style="flex:1"></span>
          <span class="chip">{{totalCount}} employees</span>
        </div>

        <div class="table-container" *ngIf="!loading; else spinner">
          <table mat-table [dataSource]="employees" class="w-full">
            <ng-container matColumnDef="code">
              <th mat-header-cell *matHeaderCellDef>ID</th>
              <td mat-cell *matCellDef="let e"><span class="chip">{{e.employeeCode}}</span></td>
            </ng-container>
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let e">
                <div class="emp-name-cell">
                  <div class="emp-avatar">{{e.fullName[0]}}</div>
                  <div><div style="font-weight:600">{{e.fullName}}</div><div style="font-size:12px;color:var(--text-muted)">{{e.email}}</div></div>
                </div>
              </td>
            </ng-container>
            <ng-container matColumnDef="department">
              <th mat-header-cell *matHeaderCellDef>Department</th>
              <td mat-cell *matCellDef="let e">{{e.departmentName}}</td>
            </ng-container>
            <ng-container matColumnDef="designation">
              <th mat-header-cell *matHeaderCellDef>Designation</th>
              <td mat-cell *matCellDef="let e">{{e.designationTitle}}</td>
            </ng-container>
            <ng-container matColumnDef="joining">
              <th mat-header-cell *matHeaderCellDef>Joined</th>
              <td mat-cell *matCellDef="let e">{{e.joiningDate | date:'mediumDate'}}</td>
            </ng-container>
            <ng-container matColumnDef="salary">
              <th mat-header-cell *matHeaderCellDef>Salary</th>
              <td mat-cell *matCellDef="let e">{{e.basicSalary ? ('৳' + (e.basicSalary | number:'1.0-0')) : '—'}}</td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let e">
                <span class="badge" [ngClass]="statusClass(e.status)">{{e.status}}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let e">
                <button mat-icon-button [routerLink]="['/employees', e.id]" matTooltip="View Details"><mat-icon>visibility</mat-icon></button>
                <button *ngIf="auth.isAdminOrHR" mat-icon-button (click)="openForm(e)" matTooltip="Edit"><mat-icon>edit</mat-icon></button>
                <button *ngIf="auth.isAdmin" mat-icon-button color="warn" (click)="deleteEmployee(e)" matTooltip="Delete"><mat-icon>delete</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns;"></tr>
          </table>
          <div *ngIf="employees.length === 0" class="empty-state">
            <mat-icon>people_outline</mat-icon>
            <h3>No employees found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        </div>
        <ng-template #spinner><div class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div></ng-template>

        <div class="pagination-row">
          <span class="text-muted" style="font-size:13px;color:var(--text-muted)">
            Showing {{(page-1)*pageSize+1}}–{{Math.min(page*pageSize, totalCount)}} of {{totalCount}}
          </span>
          <div style="display:flex;gap:8px">
            <button mat-icon-button [disabled]="page<=1" (click)="prevPage()"><mat-icon>chevron_left</mat-icon></button>
            <span style="display:flex;align-items:center;font-size:13px">{{page}} / {{totalPages}}</span>
            <button mat-icon-button [disabled]="page>=totalPages" (click)="nextPage()"><mat-icon>chevron_right</mat-icon></button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .emp-name-cell { display:flex; align-items:center; gap:10px; }
    .emp-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent-dark)); display:flex; align-items:center; justify-content:center; font-weight:700; color:#fff; flex-shrink:0; }
    .pagination-row { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-top:1px solid var(--border); }
  `]
})
export class EmployeeListComponent implements OnInit {
  employees: any[] = [];
  departments: any[] = [];
  loading = false;
  filters: any = { search: '', departmentId: null, status: '', gender: '' };
  page = 1; pageSize = 10; totalCount = 0;
  columns = ['code','name','department','designation','joining','salary','status','actions'];
  Math = Math;
  private searchTimer: any;

  constructor(public auth: AuthService, private empSvc: EmployeeService, private deptSvc: DepartmentService, private dialog: MatDialog, private snack: MatSnackBar) {}

  get totalPages() { return Math.ceil(this.totalCount / this.pageSize) || 1; }

  ngOnInit() { this.deptSvc.getAll().subscribe({ next: d => this.departments = d }); this.load(); }

  load() {
    this.loading = true;
    const params = { ...this.filters, page: this.page, pageSize: this.pageSize };
    this.empSvc.getAll(params).subscribe({
      next: (r: any) => { this.employees = r.items; this.totalCount = r.totalCount; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onSearch() { clearTimeout(this.searchTimer); this.page = 1; this.searchTimer = setTimeout(() => this.load(), 400); }
  prevPage() { if (this.page > 1) { this.page--; this.load(); } }
  nextPage() { if (this.page < this.totalPages) { this.page++; this.load(); } }

  statusClass(s: string) {
    return { 'badge-success': s==='Active', 'badge-warning': s==='Inactive', 'badge-danger': s==='Terminated', 'badge-muted': s==='Resigned' };
  }

  openForm(emp?: any) {
    const ref = this.dialog.open(EmployeeFormDialogComponent, { width: '700px', data: { emp, departments: this.departments }, panelClass: 'dark-dialog' });
    ref.afterClosed().subscribe(r => { if (r) { this.snack.open(r.message || 'Saved!', '×', { duration: 3000 }); this.load(); } });
  }

  deleteEmployee(emp: any) {
    const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete Employee', message: `Delete ${emp.fullName}? This action cannot be undone.` } });
    ref.afterClosed().subscribe(ok => {
      if (ok) this.empSvc.delete(emp.id).subscribe({ next: () => { this.snack.open('Employee deleted', '×', { duration: 3000 }); this.load(); } });
    });
  }
}
