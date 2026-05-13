import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeService, DepartmentService } from '../../../core/services';

@Component({
  selector: 'app-employee-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatProgressSpinnerModule],
  template: `
    <div class="dialog-header">
      <mat-icon>{{isEdit ? 'edit' : 'person_add'}}</mat-icon>
      <h2>{{isEdit ? 'Edit Employee' : 'Add New Employee'}}</h2>
      <button mat-icon-button (click)="close()"><mat-icon>close</mat-icon></button>
    </div>
    <mat-dialog-content>
      <form [formGroup]="form" class="emp-form">
        <div class="form-row">
          <mat-form-field appearance="outline"><mat-label>First Name</mat-label><input matInput formControlName="firstName" id="firstName"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Last Name</mat-label><input matInput formControlName="lastName" id="lastName"></mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput formControlName="email" type="email" id="email"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Phone</mat-label><input matInput formControlName="phoneNumber" id="phone"></mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Gender</mat-label>
            <mat-select formControlName="gender">
              <mat-option value="Male">Male</mat-option>
              <mat-option value="Female">Female</mat-option>
              <mat-option value="Other">Other</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="Active">Active</mat-option>
              <mat-option value="Inactive">Inactive</mat-option>
              <mat-option value="Resigned">Resigned</mat-option>
              <mat-option value="Terminated">Terminated</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline"><mat-label>Date of Birth</mat-label><input matInput [matDatepicker]="dob" formControlName="dateOfBirth"><mat-datepicker-toggle matSuffix [for]="dob"></mat-datepicker-toggle><mat-datepicker #dob></mat-datepicker></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Joining Date</mat-label><input matInput [matDatepicker]="jd" formControlName="joiningDate"><mat-datepicker-toggle matSuffix [for]="jd"></mat-datepicker-toggle><mat-datepicker #jd></mat-datepicker></mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline">
            <mat-label>Department</mat-label>
            <mat-select formControlName="departmentId" (selectionChange)="onDeptChange($event.value)" id="dept-select">
              <mat-option *ngFor="let d of data.departments" [value]="d.id">{{d.name}}</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Designation</mat-label>
            <mat-select formControlName="designationId" id="desig-select">
              <mat-option *ngFor="let d of designations" [value]="d.id">{{d.title}}</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
        <div class="form-row">
          <mat-form-field appearance="outline"><mat-label>National ID</mat-label><input matInput formControlName="nationalId"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Bank Account</mat-label><input matInput formControlName="bankAccountNumber"></mat-form-field>
        </div>
        <mat-form-field appearance="outline" class="form-full"><mat-label>Address</mat-label><textarea matInput formControlName="address" rows="2"></textarea></mat-form-field>
        <mat-form-field appearance="outline" class="form-full"><mat-label>Emergency Contact</mat-label><input matInput formControlName="emergencyContact"></mat-form-field>
        <div *ngIf="error" class="error-msg"><mat-icon>error</mat-icon>{{error}}</div>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button class="btn-primary" (click)="submit()" [disabled]="loading || form.invalid" id="save-employee-btn">
        <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
        <span *ngIf="!loading">{{isEdit ? 'Update' : 'Create'}} Employee</span>
      </button>
    </mat-dialog-actions>
  `,
  styles: [`.dialog-header{display:flex;align-items:center;gap:12px;padding:20px 24px;border-bottom:1px solid var(--border);h2{flex:1;font-size:18px;font-weight:700}mat-icon:first-child{color:var(--accent-light)}}.error-msg{display:flex;align-items:center;gap:6px;color:var(--danger);font-size:13px;margin-top:8px;mat-icon{font-size:18px;width:18px;height:18px}}.emp-form{display:flex;flex-direction:column;gap:4px;padding-top:12px}`]
})
export class EmployeeFormDialogComponent {
  form: any;
  designations: any[] = [];
  loading = false; error = '';
  isEdit: boolean;

  constructor(
    private fb: FormBuilder, private empSvc: EmployeeService, private deptSvc: DepartmentService,
    public dialogRef: MatDialogRef<EmployeeFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { emp: any; departments: any[] }
  ) {
    this.isEdit = !!data.emp;
    const e = data.emp;
    this.form = this.fb.group({
      firstName: [e?.fullName?.split(' ')[0] || '', Validators.required],
      lastName: [e?.fullName?.split(' ').slice(1).join(' ') || '', Validators.required],
      email: [e?.email || '', [Validators.required, Validators.email]],
      phoneNumber: [e?.phoneNumber || '', Validators.required],
      gender: [e?.gender || 'Male', Validators.required],
      status: [e?.status || 'Active', Validators.required],
      dateOfBirth: [e?.dateOfBirth || null, Validators.required],
      joiningDate: [e?.joiningDate || null, Validators.required],
      departmentId: [e?.departmentId || null, Validators.required],
      designationId: [e?.designationId || null, Validators.required],
      nationalId: [e?.nationalId || ''],
      bankAccountNumber: [e?.bankAccountNumber || ''],
      address: [e?.address || ''],
      emergencyContact: [e?.emergencyContact || ''],
    });
    if (e?.departmentId) this.onDeptChange(e.departmentId);
  }

  onDeptChange(deptId: number) {
    this.deptSvc.getDesignations(deptId).subscribe({ next: (d: any[]) => this.designations = d });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const obs = this.isEdit
      ? this.empSvc.update(this.data.emp.id, this.form.value)
      : this.empSvc.create(this.form.value);
    obs.subscribe({
      next: (r: any) => { this.loading = false; this.dialogRef.close({ message: this.isEdit ? 'Employee updated!' : 'Employee created!' }); },
      error: (e: any) => { this.error = e?.error?.message || 'Failed to save'; this.loading = false; }
    });
  }
  close() { this.dialogRef.close(); }
}
