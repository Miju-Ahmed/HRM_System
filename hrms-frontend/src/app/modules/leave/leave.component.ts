import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LeaveService, EmployeeService } from '../../core/services';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-leave',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTabsModule, MatButtonModule,
    MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule,
    MatNativeDateModule, MatTableModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-content fade-in-up">
      <div class="page-header">
        <div><h1>Leave Management</h1><div class="breadcrumb">Apply and manage employee leaves</div></div>
      </div>

      <!-- Leave Balance Cards -->
      <div class="stats-grid" *ngIf="leaveBalances.length">
        <div *ngFor="let lb of leaveBalances" class="stat-card info">
          <div class="stat-label">{{lb.leaveTypeName}}</div>
          <div class="stat-value">{{lb.remainingDays}}</div>
          <div class="stat-sub">Used: {{lb.usedDays}} / {{lb.maxDays}} days</div>
          <mat-icon class="stat-icon">beach_access</mat-icon>
        </div>
      </div>

      <mat-tab-group>
        <!-- Apply Leave Tab -->
        <mat-tab label="Apply Leave">
          <div class="tab-layout-leave">
            <form [formGroup]="applyForm" (ngSubmit)="applyLeave()" class="leave-form card">
              <div class="card-header"><h3>New Leave Application</h3></div>
              <div class="form-body">
                <mat-form-field appearance="outline" *ngIf="auth.isAdminOrHR">
                  <mat-label>Employee</mat-label>
                  <mat-select formControlName="employeeId" id="leave-employee">
                    <mat-option *ngFor="let e of employees" [value]="e.id">{{e.fullName}}</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Leave Type</mat-label>
                  <mat-select formControlName="leaveTypeId" id="leave-type">
                    <mat-option *ngFor="let t of leaveTypes" [value]="t.id">{{t.name}} ({{t.maxDaysPerYear}} days/yr)</mat-option>
                  </mat-select>
                </mat-form-field>
                <div class="form-row">
                  <mat-form-field appearance="outline"><mat-label>Start Date</mat-label><input matInput [matDatepicker]="sd" formControlName="startDate" id="leave-start"><mat-datepicker-toggle matSuffix [for]="sd"></mat-datepicker-toggle><mat-datepicker #sd></mat-datepicker></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>End Date</mat-label><input matInput [matDatepicker]="ed" formControlName="endDate" id="leave-end"><mat-datepicker-toggle matSuffix [for]="ed"></mat-datepicker-toggle><mat-datepicker #ed></mat-datepicker></mat-form-field>
                </div>
                <div class="days-preview" *ngIf="calcDays() > 0">
                  <mat-icon>info</mat-icon> <strong>{{calcDays()}} day(s)</strong> will be applied
                </div>
                <mat-form-field appearance="outline"><mat-label>Reason</mat-label><textarea matInput formControlName="reason" rows="3" id="leave-reason"></textarea></mat-form-field>
                <div *ngIf="applyError" class="error-msg"><mat-icon>error</mat-icon>{{applyError}}</div>
                <button mat-raised-button class="btn-primary" type="submit" [disabled]="applyForm.invalid || applying" id="submit-leave-btn">
                  <mat-spinner *ngIf="applying" diameter="18"></mat-spinner>
                  <span *ngIf="!applying">Submit Application</span>
                </button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- All Leaves / Pending Tab -->
        <mat-tab [label]="auth.isAdminOrHR ? 'Pending Approvals' : 'My Leaves'">
          <div style="padding-top:20px">
            <div class="search-bar card" style="margin-bottom:16px">
              <mat-form-field appearance="outline" style="min-width:160px" *ngIf="auth.isAdminOrHR">
                <mat-label>Status</mat-label>
                <mat-select [(ngModel)]="filterStatus" (ngModelChange)="loadLeaves()">
                  <mat-option value="">All</mat-option>
                  <mat-option value="Pending">Pending</mat-option>
                  <mat-option value="Approved">Approved</mat-option>
                  <mat-option value="Rejected">Rejected</mat-option>
                </mat-select>
              </mat-form-field>
            </div>

            <div class="card">
              <div class="table-container" *ngIf="!loading; else spinner">
                <table mat-table [dataSource]="leaves">
                  <ng-container matColumnDef="employee"><th mat-header-cell *matHeaderCellDef>Employee</th><td mat-cell *matCellDef="let l">{{l.employeeName}}</td></ng-container>
                  <ng-container matColumnDef="type"><th mat-header-cell *matHeaderCellDef>Type</th><td mat-cell *matCellDef="let l">{{l.leaveTypeName}}</td></ng-container>
                  <ng-container matColumnDef="dates"><th mat-header-cell *matHeaderCellDef>Dates</th><td mat-cell *matCellDef="let l">{{l.startDate|date:'mediumDate'}} – {{l.endDate|date:'mediumDate'}}</td></ng-container>
                  <ng-container matColumnDef="days"><th mat-header-cell *matHeaderCellDef>Days</th><td mat-cell *matCellDef="let l"><span class="chip">{{l.totalDays}} day(s)</span></td></ng-container>
                  <ng-container matColumnDef="reason"><th mat-header-cell *matHeaderCellDef>Reason</th><td mat-cell *matCellDef="let l" style="max-width:200px">{{l.reason}}</td></ng-container>
                  <ng-container matColumnDef="status"><th mat-header-cell *matHeaderCellDef>Status</th>
                    <td mat-cell *matCellDef="let l"><span class="badge" [ngClass]="leaveClass(l.status)">{{l.status}}</span></td>
                  </ng-container>
                  <ng-container matColumnDef="actions"><th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let l">
                      <ng-container *ngIf="auth.isAdminOrHR && l.status==='Pending'">
                        <button mat-icon-button (click)="review(l,'Approve')" matTooltip="Approve" id="approve-leave-btn"><mat-icon style="color:var(--success)">check_circle</mat-icon></button>
                        <button mat-icon-button (click)="review(l,'Reject')" matTooltip="Reject" id="reject-leave-btn"><mat-icon style="color:var(--danger)">cancel</mat-icon></button>
                      </ng-container>
                    </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="leaveCols"></tr>
                  <tr mat-row *matRowDef="let r; columns: leaveCols;"></tr>
                </table>
                <div *ngIf="leaves.length===0" class="empty-state"><mat-icon>beach_access</mat-icon><h3>No leave records</h3></div>
              </div>
              <ng-template #spinner><div class="loading-overlay"><mat-spinner diameter="40"></mat-spinner></div></ng-template>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .tab-layout-leave{padding-top:20px;max-width:600px}
    .leave-form{} .form-body{padding:20px;display:flex;flex-direction:column;gap:10px}
    .days-preview{display:flex;align-items:center;gap:8px;color:var(--info);font-size:13px;background:rgba(59,130,246,.1);padding:8px 12px;border-radius:8px;mat-icon{font-size:18px;width:18px}}
    .error-msg{display:flex;align-items:center;gap:6px;color:var(--danger);font-size:13px;mat-icon{font-size:18px;width:18px}}
  `]
})
export class LeaveComponent implements OnInit {
  leaveTypes: any[] = [];
  leaveBalances: any[] = [];
  leaves: any[] = [];
  employees: any[] = [];
  loading = false; applying = false; applyError = '';
  filterStatus = 'Pending';
  applyForm: any;
  leaveCols = ['employee','type','dates','days','reason','status','actions'];

  constructor(public auth: AuthService, private leaveSvc: LeaveService, private empSvc: EmployeeService, private fb: FormBuilder, private snack: MatSnackBar) {}

  ngOnInit() {
    this.applyForm = this.fb.group({
      employeeId: [this.auth.currentUser?.employeeId, Validators.required],
      leaveTypeId: [null, Validators.required],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
      reason: ['', Validators.required]
    });
    this.leaveSvc.getTypes().subscribe({ next: t => this.leaveTypes = t });
    if (this.auth.isAdminOrHR) {
      this.empSvc.getAll({ pageSize: 100 }).subscribe({ next: (d: any) => this.employees = d.items });
      this.leaveCols = ['employee','type','dates','days','reason','status','actions'];
    } else {
      this.leaveCols = ['type','dates','days','reason','status','actions'];
    }
    this.loadBalance();
    this.loadLeaves();
  }

  loadBalance() {
    const empId = this.auth.currentUser?.employeeId;
    if (empId) this.leaveSvc.getBalance(empId).subscribe({ next: d => this.leaveBalances = d });
  }

  loadLeaves() {
    this.loading = true;
    const params: any = {};
    if (!this.auth.isAdminOrHR) params.employeeId = this.auth.currentUser?.employeeId;
    if (this.filterStatus) params.status = this.filterStatus;
    this.leaveSvc.getAll(params).subscribe({ next: d => { this.leaves = d; this.loading = false; }, error: () => this.loading = false });
  }

  calcDays(): number {
    const s = this.applyForm.value.startDate, e = this.applyForm.value.endDate;
    if (!s || !e) return 0;
    return Math.max(0, Math.floor((new Date(e).getTime() - new Date(s).getTime()) / 86400000) + 1);
  }

  applyLeave() {
    this.applying = true; this.applyError = '';
    const v = this.applyForm.value;
    this.leaveSvc.apply(v).subscribe({
      next: () => { this.snack.open('Leave application submitted!', '×', { duration: 3000 }); this.applying = false; this.applyForm.reset({ employeeId: this.auth.currentUser?.employeeId }); this.loadLeaves(); this.loadBalance(); },
      error: (e: any) => { this.applyError = e?.error?.message || 'Failed to submit'; this.applying = false; }
    });
  }

  review(leave: any, action: string) {
    this.leaveSvc.review(leave.id, { action }).subscribe({
      next: () => { this.snack.open(`Leave ${action}d!`, '×', { duration: 3000 }); this.loadLeaves(); }
    });
  }

  leaveClass(s: string) { return { 'badge-warning': s==='Pending', 'badge-success': s==='Approved', 'badge-danger': s==='Rejected', 'badge-muted': s==='Cancelled' }; }
}
