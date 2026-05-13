import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { SalaryService } from '../../../core/services';
import { AuthService } from '../../../core/auth.service';
import { ConfirmDialogComponent } from '../../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-salary-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, MatTabsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatTableModule,
    MatSnackBarModule, MatProgressSpinnerModule, MatDialogModule],
  template: `
    <div class="page-content fade-in-up">
      <div class="page-header">
        <div style="display:flex;align-items:center;gap:12px">
          <button mat-icon-button routerLink="/salary"><mat-icon>arrow_back</mat-icon></button>
          <div>
            <h1>{{data?.salary?.employeeName || 'Salary Setup'}}</h1>
            <div class="breadcrumb">{{data?.salary?.employeeCode}} · {{data?.salary?.departmentName}}</div>
          </div>
        </div>
        <ng-container *ngIf="data?.salary">
          <div class="salary-header-badges">
            <div class="badge-pill accent">Gross: ৳{{data.salary.grossSalary | number:'1.0-0'}}</div>
            <div class="badge-pill success">Net: ৳{{data.salary.netSalary | number:'1.0-0'}}</div>
          </div>
        </ng-container>
      </div>

      <mat-tab-group *ngIf="!loading; else spinner">
        <!-- Salary Setup Tab -->
        <mat-tab label="Salary Setup">
          <div class="tab-layout">
            <form [formGroup]="salaryForm" (ngSubmit)="saveSalary()" class="salary-form card">
              <div class="card-header"><h3>Salary Components</h3></div>
              <div class="form-body">
                <div class="form-row">
                  <mat-form-field appearance="outline"><mat-label>Basic Salary (৳)</mat-label><input matInput type="number" formControlName="basicSalary" id="basicSalary"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>House Rent Allowance (৳)</mat-label><input matInput type="number" formControlName="houseRentAllowance"></mat-form-field>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="outline"><mat-label>Medical Allowance (৳)</mat-label><input matInput type="number" formControlName="medicalAllowance"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Transport Allowance (৳)</mat-label><input matInput type="number" formControlName="transportAllowance"></mat-form-field>
                </div>
                <div class="form-row">
                  <mat-form-field appearance="outline"><mat-label>Other Allowance (৳)</mat-label><input matInput type="number" formControlName="otherAllowance"></mat-form-field>
                  <mat-form-field appearance="outline"><mat-label>Provident Fund (৳)</mat-label><input matInput type="number" formControlName="providentFund"></mat-form-field>
                </div>
                <mat-form-field appearance="outline" *ngIf="data?.salary">
                  <mat-label>Revision Reason</mat-label>
                  <input matInput formControlName="revisionReason" placeholder="e.g. Annual increment">
                </mat-form-field>

                <div class="salary-summary" *ngIf="salaryForm.value.basicSalary">
                  <div class="summary-row"><span>Gross Salary</span><strong>৳{{calcGross() | number:'1.0-0'}}</strong></div>
                  <div class="summary-row"><span>Tax (10% above ৳25K)</span><strong style="color:var(--danger)">-৳{{calcTax() | number:'1.0-0'}}</strong></div>
                  <div class="summary-row"><span>Provident Fund</span><strong style="color:var(--danger)">-৳{{+salaryForm.value.providentFund | number:'1.0-0'}}</strong></div>
                  <div class="summary-row net"><span>Net Salary</span><strong style="color:var(--success)">৳{{calcNet() | number:'1.0-0'}}</strong></div>
                </div>
                <button mat-raised-button class="btn-primary" type="submit" [disabled]="salaryForm.invalid || saving" id="save-salary-btn">
                  <mat-spinner *ngIf="saving" diameter="18"></mat-spinner>
                  <span *ngIf="!saving">{{data?.salary ? 'Update Salary' : 'Set Salary'}}</span>
                </button>
              </div>
            </form>
          </div>
        </mat-tab>

        <!-- Revision History Tab -->
        <mat-tab label="Revision History">
          <div style="padding:20px">
            <div *ngIf="data?.revisions?.length === 0" class="empty-state"><mat-icon>history</mat-icon><h3>No revision history yet</h3></div>
            <div *ngFor="let r of data?.revisions" class="revision-card card">
              <div class="revision-header">
                <div><span class="chip">{{r.revisionDate | date:'mediumDate'}}</span> &nbsp; by <strong>{{r.revisedBy}}</strong></div>
                <div>
                  <span style="color:var(--danger)">৳{{r.oldBasicSalary | number:'1.0-0'}}</span>
                  <mat-icon style="font-size:16px;vertical-align:middle">arrow_forward</mat-icon>
                  <span style="color:var(--success)">৳{{r.newBasicSalary | number:'1.0-0'}}</span>
                </div>
              </div>
              <p style="color:var(--text-muted);font-size:13px;margin-top:6px">{{r.reason}}</p>
            </div>
          </div>
        </mat-tab>

        <!-- Bonuses Tab -->
        <mat-tab label="Bonuses">
          <div class="tab-layout">
            <form [formGroup]="bonusForm" (ngSubmit)="addBonus()" class="side-form card" *ngIf="auth.isAdminOrHR">
              <div class="card-header"><h3>Add Bonus</h3></div>
              <div class="form-body">
                <mat-form-field appearance="outline">
                  <mat-label>Bonus Type</mat-label>
                  <mat-select formControlName="bonusType">
                    <mat-option value="Festival">Festival Bonus</mat-option>
                    <mat-option value="Performance">Performance Bonus</mat-option>
                    <mat-option value="Incentive">Incentive</mat-option>
                    <mat-option value="Others">Others</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Amount (৳)</mat-label><input matInput type="number" formControlName="amount" id="bonus-amount"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Remarks</mat-label><input matInput formControlName="remarks"></mat-form-field>
                <button mat-raised-button class="btn-primary" type="submit" [disabled]="bonusForm.invalid">Add Bonus</button>
              </div>
            </form>
            <div class="list-side">
              <div *ngFor="let b of data?.bonuses" class="list-card card">
                <div class="list-card-row">
                  <div><strong>{{b.bonusType}}</strong><br><small style="color:var(--text-muted)">{{b.bonusDate | date:'mediumDate'}} · {{b.remarks}}</small></div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span class="badge badge-success">+৳{{b.amount | number:'1.0-0'}}</span>
                    <button *ngIf="auth.isAdminOrHR" mat-icon-button color="warn" (click)="deleteBonus(b)"><mat-icon>delete</mat-icon></button>
                  </div>
                </div>
              </div>
              <div *ngIf="!data?.bonuses?.length" class="empty-state"><mat-icon>card_giftcard</mat-icon><h3>No bonuses added</h3></div>
            </div>
          </div>
        </mat-tab>

        <!-- Deductions Tab -->
        <mat-tab label="Deductions">
          <div class="tab-layout">
            <form [formGroup]="deductionForm" (ngSubmit)="addDeduction()" class="side-form card" *ngIf="auth.isAdminOrHR">
              <div class="card-header"><h3>Add Deduction</h3></div>
              <div class="form-body">
                <mat-form-field appearance="outline">
                  <mat-label>Deduction Type</mat-label>
                  <mat-select formControlName="deductionType">
                    <mat-option value="Tax">Tax</mat-option>
                    <mat-option value="Loan">Loan Repayment</mat-option>
                    <mat-option value="Absence">Absence</mat-option>
                    <mat-option value="Others">Others</mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Amount (৳)</mat-label><input matInput type="number" formControlName="amount" id="deduction-amount"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Remarks</mat-label><input matInput formControlName="remarks"></mat-form-field>
                <button mat-raised-button color="warn" type="submit" [disabled]="deductionForm.invalid">Add Deduction</button>
              </div>
            </form>
            <div class="list-side">
              <div *ngFor="let d of data?.deductions" class="list-card card">
                <div class="list-card-row">
                  <div><strong>{{d.deductionType}}</strong><br><small style="color:var(--text-muted)">{{d.deductionDate | date:'mediumDate'}} · {{d.remarks}}</small></div>
                  <div style="display:flex;align-items:center;gap:8px">
                    <span class="badge badge-danger">-৳{{d.amount | number:'1.0-0'}}</span>
                    <button *ngIf="auth.isAdminOrHR" mat-icon-button color="warn" (click)="deleteDeduction(d)"><mat-icon>delete</mat-icon></button>
                  </div>
                </div>
              </div>
              <div *ngIf="!data?.deductions?.length" class="empty-state"><mat-icon>remove_circle_outline</mat-icon><h3>No deductions added</h3></div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
      <ng-template #spinner><div class="loading-overlay" style="height:400px"><mat-spinner diameter="40"></mat-spinner></div></ng-template>
    </div>
  `,
  styles: [`
    .salary-header-badges{display:flex;gap:10px}
    .badge-pill{padding:6px 14px;border-radius:20px;font-size:13px;font-weight:600}
    .badge-pill.accent{background:rgba(99,102,241,.15);color:var(--accent-light)}
    .badge-pill.success{background:rgba(16,185,129,.15);color:var(--success)}
    .tab-layout{display:grid;grid-template-columns:340px 1fr;gap:20px;padding-top:20px}
    .salary-form{} .form-body{padding:20px;display:flex;flex-direction:column;gap:10px}
    .salary-summary{background:var(--bg-secondary);border-radius:var(--radius-sm);padding:16px;margin:8px 0}
    .summary-row{display:flex;justify-content:space-between;padding:6px 0;font-size:14px;border-bottom:1px solid var(--border);&:last-child{border:none}&.net strong{font-size:18px;color:var(--success)}}
    .revision-card{padding:0;margin-bottom:12px}
    .revision-header{display:flex;justify-content:space-between;align-items:center;padding:14px 20px;border-bottom:1px solid var(--border)}
    .side-form{} .list-side{display:flex;flex-direction:column;gap:10px}
    .list-card{padding:0}
    .list-card-row{display:flex;align-items:center;justify-content:space-between;padding:14px 20px}
    @media(max-width:900px){.tab-layout{grid-template-columns:1fr}}
  `]
})
export class SalaryDetailComponent implements OnInit {
  employeeId!: number;
  data: any = null;
  loading = false; saving = false;
  salaryForm: any; bonusForm: any; deductionForm: any;

  constructor(
    private route: ActivatedRoute, private fb: FormBuilder,
    public auth: AuthService, private salSvc: SalaryService,
    private snack: MatSnackBar, private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.employeeId = +this.route.snapshot.params['id'];
    this.initForms();
    this.load();
  }

  initForms() {
    this.salaryForm = this.fb.group({
      basicSalary: [0, [Validators.required, Validators.min(0)]],
      houseRentAllowance: [0, Validators.min(0)],
      medicalAllowance: [0, Validators.min(0)],
      transportAllowance: [0, Validators.min(0)],
      otherAllowance: [0, Validators.min(0)],
      providentFund: [0, Validators.min(0)],
      revisionReason: [''],
      effectiveFrom: [new Date().toISOString()]
    });
    this.bonusForm = this.fb.group({ bonusType: ['Festival', Validators.required], amount: [0, [Validators.required, Validators.min(1)]], remarks: [''], bonusDate: [new Date().toISOString()] });
    this.deductionForm = this.fb.group({ deductionType: ['Tax', Validators.required], amount: [0, [Validators.required, Validators.min(1)]], remarks: [''], deductionDate: [new Date().toISOString()] });
  }

  load() {
    this.loading = true;
    this.salSvc.getByEmployee(this.employeeId).subscribe({
      next: d => { this.data = d; this.loading = false; if (d.salary) this.salaryForm.patchValue(d.salary); },
      error: () => this.loading = false
    });
  }

  calcGross() { const v = this.salaryForm.value; return (+v.basicSalary||0)+(+v.houseRentAllowance||0)+(+v.medicalAllowance||0)+(+v.transportAllowance||0)+(+v.otherAllowance||0); }
  calcTax() { const g = this.calcGross(); return g > 25000 ? (g - 25000) * 0.10 : 0; }
  calcNet() { return this.calcGross() - this.calcTax() - (+this.salaryForm.value.providentFund||0); }

  saveSalary() {
    this.saving = true;
    this.salSvc.setSalary(this.employeeId, this.salaryForm.value).subscribe({
      next: () => { this.snack.open('Salary saved!', '×', { duration: 3000 }); this.saving = false; this.load(); },
      error: (e: any) => { this.snack.open(e?.error?.message || 'Error', '×', { duration: 3000 }); this.saving = false; }
    });
  }

  addBonus() {
    this.salSvc.addBonus(this.employeeId, this.bonusForm.value).subscribe({
      next: () => { this.snack.open('Bonus added!', '×', { duration: 3000 }); this.bonusForm.reset({ bonusType: 'Festival', amount: 0, bonusDate: new Date().toISOString() }); this.load(); }
    });
  }

  deleteBonus(b: any) {
    this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete Bonus', message: `Remove ৳${b.amount} bonus?` } })
      .afterClosed().subscribe(ok => { if (ok) this.salSvc.deleteBonus(b.id).subscribe({ next: () => { this.snack.open('Deleted', '×', { duration: 2000 }); this.load(); } }); });
  }

  addDeduction() {
    this.salSvc.addDeduction(this.employeeId, this.deductionForm.value).subscribe({
      next: () => { this.snack.open('Deduction added!', '×', { duration: 3000 }); this.deductionForm.reset({ deductionType: 'Tax', amount: 0, deductionDate: new Date().toISOString() }); this.load(); }
    });
  }

  deleteDeduction(d: any) {
    this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete Deduction', message: `Remove ৳${d.amount} deduction?` } })
      .afterClosed().subscribe(ok => { if (ok) this.salSvc.deleteDeduction(d.id).subscribe({ next: () => { this.snack.open('Deleted', '×', { duration: 2000 }); this.load(); } }); });
  }
}
