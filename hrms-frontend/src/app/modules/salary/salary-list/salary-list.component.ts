import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { SalaryService } from '../../../core/services';

@Component({
  selector: 'app-salary-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatTableModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="page-content fade-in-up">
      <div class="page-header">
        <div><h1>Salary Management</h1><div class="breadcrumb">View and manage employee salaries</div></div>
      </div>
      <div class="card">
        <div class="search-bar">
          <mat-form-field appearance="outline" style="min-width:260px">
            <mat-label>Search by name or code...</mat-label>
            <input matInput [(ngModel)]="search" id="salary-search">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>
        </div>
        <div class="table-container" *ngIf="!loading; else spinner">
          <table mat-table [dataSource]="filtered">
            <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>ID</th><td mat-cell *matCellDef="let s"><span class="chip">{{s.employeeCode}}</span></td></ng-container>
            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Employee</th><td mat-cell *matCellDef="let s"><strong>{{s.employeeName}}</strong><br><small style="color:var(--text-muted)">{{s.departmentName}}</small></td></ng-container>
            <ng-container matColumnDef="basic"><th mat-header-cell *matHeaderCellDef>Basic</th><td mat-cell *matCellDef="let s">৳{{s.basicSalary | number:'1.0-0'}}</td></ng-container>
            <ng-container matColumnDef="gross"><th mat-header-cell *matHeaderCellDef>Gross</th><td mat-cell *matCellDef="let s">৳{{s.grossSalary | number:'1.0-0'}}</td></ng-container>
            <ng-container matColumnDef="deductions"><th mat-header-cell *matHeaderCellDef>Deductions</th><td mat-cell *matCellDef="let s" style="color:var(--danger)">-৳{{(s.providentFund + s.taxAmount) | number:'1.0-0'}}</td></ng-container>
            <ng-container matColumnDef="net"><th mat-header-cell *matHeaderCellDef>Net Salary</th><td mat-cell *matCellDef="let s"><strong style="color:var(--success)">৳{{s.netSalary | number:'1.0-0'}}</strong></td></ng-container>
            <ng-container matColumnDef="effective"><th mat-header-cell *matHeaderCellDef>Effective</th><td mat-cell *matCellDef="let s">{{s.effectiveFrom | date:'mediumDate'}}</td></ng-container>
            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let s">
                <button mat-raised-button class="btn-outline" [routerLink]="['/salary', s.employeeId]" style="font-size:12px;padding:4px 12px">
                  <mat-icon style="font-size:16px">manage_accounts</mat-icon> Manage
                </button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols;"></tr>
          </table>
          <div *ngIf="filtered.length===0" class="empty-state"><mat-icon>payments</mat-icon><h3>No salary records found</h3></div>
        </div>
        <ng-template #spinner><div class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div></ng-template>
      </div>
    </div>
  `
})
export class SalaryListComponent implements OnInit {
  salaries: any[] = [];
  loading = false;
  search = '';
  cols = ['code','name','basic','gross','deductions','net','effective','actions'];

  get filtered() { return this.search ? this.salaries.filter(s => s.employeeName.toLowerCase().includes(this.search.toLowerCase()) || s.employeeCode.toLowerCase().includes(this.search.toLowerCase())) : this.salaries; }

  constructor(private salSvc: SalaryService) {}
  ngOnInit() { this.loading = true; this.salSvc.getAll().subscribe({ next: d => { this.salaries = d; this.loading = false; }, error: () => this.loading = false }); }
}
