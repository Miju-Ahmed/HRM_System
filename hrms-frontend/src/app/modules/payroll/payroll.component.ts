import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { PayrollService } from '../../core/services';
import { AuthService } from '../../core/auth.service';
import { PayslipDialogComponent } from './payslip-dialog/payslip-dialog.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-payroll',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule, MatSelectModule,
    MatFormFieldModule, MatTableModule, MatSnackBarModule, MatProgressSpinnerModule, MatDialogModule],
  template: `
    <div class="page-content fade-in-up">
      <div class="page-header">
        <div><h1>Payroll Management</h1><div class="breadcrumb">Generate and manage monthly payroll</div></div>
      </div>

      <!-- Generate Bar (Admin/HR only) -->
      <div class="card generate-bar" *ngIf="auth.isAdminOrHR">
        <div class="card-header"><h3>Generate Payroll</h3></div>
        <div class="gen-controls">
          <mat-form-field appearance="outline">
            <mat-label>Month</mat-label>
            <mat-select [(ngModel)]="genMonth">
              <mat-option *ngFor="let m of months; let i=index" [value]="i+1">{{m}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Year</mat-label>
            <mat-select [(ngModel)]="genYear">
              <mat-option *ngFor="let y of years" [value]="y">{{y}}</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button class="btn-primary" (click)="generate()" [disabled]="generating" id="generate-payroll-btn">
            <mat-spinner *ngIf="generating" diameter="18"></mat-spinner>
            <mat-icon *ngIf="!generating">play_arrow</mat-icon>
            <span>{{generating ? 'Generating...' : 'Generate'}}</span>
          </button>
        </div>
      </div>

      <!-- Filter Bar -->
      <div class="card" style="margin-bottom:20px">
        <div class="search-bar">
          <mat-form-field appearance="outline">
            <mat-label>Month</mat-label>
            <mat-select [(ngModel)]="filterMonth" (ngModelChange)="load()">
              <mat-option [value]="null">All Months</mat-option>
              <mat-option *ngFor="let m of months; let i=index" [value]="i+1">{{m}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Year</mat-label>
            <mat-select [(ngModel)]="filterYear" (ngModelChange)="load()">
              <mat-option *ngFor="let y of years" [value]="y">{{y}}</mat-option>
            </mat-select>
          </mat-form-field>
          <span style="flex:1"></span>
          <div class="summary-chips" *ngIf="payrolls.length">
            <span class="chip">{{payrolls.length}} records</span>
            <span class="chip success-chip">৳{{totalNet | number:'1.0-0'}} net</span>
          </div>
        </div>
      </div>

      <!-- Payroll Table -->
      <div class="card">
        <div class="table-container" *ngIf="!loading; else spinner">
          <table mat-table [dataSource]="payrolls">
            <ng-container matColumnDef="code"><th mat-header-cell *matHeaderCellDef>ID</th><td mat-cell *matCellDef="let p"><span class="chip">{{p.employeeCode}}</span></td></ng-container>
            <ng-container matColumnDef="name"><th mat-header-cell *matHeaderCellDef>Employee</th>
              <td mat-cell *matCellDef="let p"><strong>{{p.employeeName}}</strong><br><small style="color:var(--text-muted)">{{p.departmentName}}</small></td>
            </ng-container>
            <ng-container matColumnDef="period"><th mat-header-cell *matHeaderCellDef>Period</th><td mat-cell *matCellDef="let p">{{months[p.month-1]}} {{p.year}}</td></ng-container>
            <ng-container matColumnDef="gross"><th mat-header-cell *matHeaderCellDef>Gross</th><td mat-cell *matCellDef="let p">৳{{p.grossSalary | number:'1.0-0'}}</td></ng-container>
            <ng-container matColumnDef="bonus"><th mat-header-cell *matHeaderCellDef>Bonus</th><td mat-cell *matCellDef="let p" style="color:var(--success)">+৳{{p.totalBonus | number:'1.0-0'}}</td></ng-container>
            <ng-container matColumnDef="deductions"><th mat-header-cell *matHeaderCellDef>Deductions</th><td mat-cell *matCellDef="let p" style="color:var(--danger)">-৳{{(p.totalDeduction+p.taxAmount+p.providentFund) | number:'1.0-0'}}</td></ng-container>
            <ng-container matColumnDef="net"><th mat-header-cell *matHeaderCellDef>Net</th><td mat-cell *matCellDef="let p"><strong style="color:var(--success)">৳{{p.netSalary | number:'1.0-0'}}</strong></td></ng-container>
            <ng-container matColumnDef="attendance"><th mat-header-cell *matHeaderCellDef>Attendance</th><td mat-cell *matCellDef="let p">{{p.presentDays}}/{{p.workingDays}} days</td></ng-container>
            <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let p">
                <span class="badge" [ngClass]="statusClass(p.status)">{{p.status}}</span>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let p">
                <button mat-icon-button (click)="viewPayslip(p)" matTooltip="View Payslip" id="view-payslip-btn"><mat-icon>receipt</mat-icon></button>
                <button *ngIf="auth.isAdminOrHR && p.status==='Draft'" mat-icon-button (click)="approve(p)" matTooltip="Approve"><mat-icon style="color:var(--success)">check_circle</mat-icon></button>
                <button *ngIf="auth.isAdmin && p.status==='Approved'" mat-icon-button (click)="markPaid(p)" matTooltip="Mark Paid"><mat-icon style="color:var(--info)">payments</mat-icon></button>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="cols"></tr>
            <tr mat-row *matRowDef="let r; columns: cols;"></tr>
          </table>
          <div *ngIf="payrolls.length===0" class="empty-state">
            <mat-icon>receipt_long</mat-icon><h3>No payroll records</h3>
            <p *ngIf="auth.isAdminOrHR">Use the Generate button above to create payroll</p>
          </div>
        </div>
        <ng-template #spinner><div class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div></ng-template>
      </div>
    </div>
  `,
  styles: [`
    .generate-bar{margin-bottom:20px}
    .gen-controls{display:flex;align-items:center;gap:16px;padding:16px 20px;flex-wrap:wrap}
    .gen-controls mat-form-field{min-width:140px}
    .summary-chips{display:flex;gap:8px}
    .success-chip{background:rgba(16,185,129,.15);color:var(--success);border:1px solid rgba(16,185,129,.3)}
  `]
})
export class PayrollComponent implements OnInit {
  payrolls: any[] = [];
  loading = false; generating = false;
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  years = [2024, 2025, 2026];
  genMonth = new Date().getMonth() + 1;
  genYear = new Date().getFullYear();
  filterMonth: number | null = new Date().getMonth() + 1;
  filterYear = new Date().getFullYear();
  cols = ['code','name','period','gross','bonus','deductions','net','attendance','status','actions'];

  get totalNet() { return this.payrolls.reduce((s, p) => s + p.netSalary, 0); }

  constructor(public auth: AuthService, private payrollSvc: PayrollService, private snack: MatSnackBar, private dialog: MatDialog) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    const params: any = { year: this.filterYear };
    if (this.filterMonth) params.month = this.filterMonth;
    this.payrollSvc.getAll(params).subscribe({ next: d => { this.payrolls = d; this.loading = false; }, error: () => this.loading = false });
  }

  generate() {
    this.generating = true;
    this.payrollSvc.generate({ month: this.genMonth, year: this.genYear }).subscribe({
      next: (r: any) => { this.snack.open(r.message || 'Payroll generated!', '×', { duration: 4000 }); this.generating = false; this.filterMonth = this.genMonth; this.filterYear = this.genYear; this.load(); },
      error: (e: any) => { this.snack.open(e?.error?.message || 'Error generating payroll', '×', { duration: 3000 }); this.generating = false; }
    });
  }

  approve(p: any) {
    this.dialog.open(ConfirmDialogComponent, { data: { title: 'Approve Payroll', message: `Approve payroll for ${p.employeeName}?`, confirmText: 'Approve' } })
      .afterClosed().subscribe(ok => { if (ok) this.payrollSvc.approve(p.id).subscribe({ next: () => { this.snack.open('Approved!', '×', { duration: 2000 }); this.load(); } }); });
  }

  markPaid(p: any) {
    this.payrollSvc.markPaid(p.id).subscribe({ next: () => { this.snack.open('Marked as paid!', '×', { duration: 2000 }); this.load(); } });
  }

  viewPayslip(p: any) {
    this.dialog.open(PayslipDialogComponent, { width: '700px', data: p, panelClass: 'dark-dialog' });
  }

  statusClass(s: string) { return { 'badge-warning': s==='Draft', 'badge-info': s==='Approved', 'badge-success': s==='Paid' }; }
}
