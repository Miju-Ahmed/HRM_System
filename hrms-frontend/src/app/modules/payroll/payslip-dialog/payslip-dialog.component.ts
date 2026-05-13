import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-payslip-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="payslip" id="payslip-content">
      <div class="ps-header">
        <div class="ps-logo"><mat-icon>corporate_fare</mat-icon></div>
        <div class="ps-company">
          <h2>AIUB HRMS</h2>
          <p>American International University-Bangladesh</p>
          <p>Dhaka, Bangladesh</p>
        </div>
        <div class="ps-title">
          <h3>PAYSLIP</h3>
          <p>{{months[p.month-1]}} {{p.year}}</p>
          <span class="badge" [ngClass]="p.status==='Paid'?'badge-success':p.status==='Approved'?'badge-info':'badge-warning'">{{p.status}}</span>
        </div>
      </div>
      <div class="ps-divider"></div>

      <div class="ps-emp-info">
        <div class="ps-info-grid">
          <div><span class="ps-label">Employee Name</span><strong>{{p.employeeName}}</strong></div>
          <div><span class="ps-label">Employee ID</span><strong>{{p.employeeCode}}</strong></div>
          <div><span class="ps-label">Department</span><strong>{{p.departmentName}}</strong></div>
          <div><span class="ps-label">Designation</span><strong>{{p.designationTitle}}</strong></div>
          <div><span class="ps-label">Working Days</span><strong>{{p.workingDays}}</strong></div>
          <div><span class="ps-label">Days Present</span><strong>{{p.presentDays}}</strong></div>
        </div>
      </div>

      <div class="ps-body">
        <div class="ps-col">
          <h4>Earnings</h4>
          <div class="ps-row"><span>Basic Salary</span><span>৳{{p.basicSalary | number:'1.2-2'}}</span></div>
          <div class="ps-row"><span>House Rent Allowance</span><span>৳{{p.houseRentAllowance | number:'1.2-2'}}</span></div>
          <div class="ps-row"><span>Medical Allowance</span><span>৳{{p.medicalAllowance | number:'1.2-2'}}</span></div>
          <div class="ps-row"><span>Transport Allowance</span><span>৳{{p.transportAllowance | number:'1.2-2'}}</span></div>
          <div class="ps-row"><span>Other Allowance</span><span>৳{{p.otherAllowance | number:'1.2-2'}}</span></div>
          <div class="ps-row bonus"><span>Bonuses</span><span>+৳{{p.totalBonus | number:'1.2-2'}}</span></div>
          <div class="ps-row bonus"><span>Overtime Pay</span><span>+৳{{p.overtimePay | number:'1.2-2'}}</span></div>
          <div class="ps-total"><span>Gross Earnings</span><strong>৳{{p.grossSalary | number:'1.2-2'}}</strong></div>
        </div>
        <div class="ps-col">
          <h4>Deductions</h4>
          <div class="ps-row deduct"><span>Provident Fund</span><span>৳{{p.providentFund | number:'1.2-2'}}</span></div>
          <div class="ps-row deduct"><span>Income Tax</span><span>৳{{p.taxAmount | number:'1.2-2'}}</span></div>
          <div class="ps-row deduct"><span>Other Deductions</span><span>৳{{p.totalDeduction | number:'1.2-2'}}</span></div>
          <div class="ps-total deduct"><span>Total Deductions</span><strong>৳{{(p.providentFund + p.taxAmount + p.totalDeduction) | number:'1.2-2'}}</strong></div>
        </div>
      </div>

      <div class="ps-net">
        <span>NET SALARY</span>
        <strong>৳ {{p.netSalary | number:'1.2-2'}}</strong>
      </div>

      <div class="ps-footer">
        <p>This is a computer-generated payslip. No signature required.</p>
        <p>Generated on {{today | date:'medium'}}</p>
      </div>
    </div>
    <mat-dialog-actions align="end">
      <button mat-button (click)="dialogRef.close()">Close</button>
      <button mat-raised-button class="btn-primary" (click)="print()" id="print-payslip-btn"><mat-icon>print</mat-icon> Print</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .payslip{padding:32px;background:var(--bg-card);font-size:13px}
    .ps-header{display:flex;align-items:flex-start;gap:16px;margin-bottom:20px}
    .ps-logo{width:56px;height:56px;background:linear-gradient(135deg,var(--accent),var(--accent-dark));border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;mat-icon{font-size:28px;color:#fff}}
    .ps-company{flex:1;h2{font-size:18px;font-weight:800}p{color:var(--text-muted);font-size:12px}}
    .ps-title{text-align:right;h3{font-size:20px;font-weight:800;letter-spacing:2px}p{color:var(--text-muted);font-size:13px;margin:4px 0}}
    .ps-divider{height:2px;background:linear-gradient(90deg,var(--accent),var(--accent-light));border-radius:2px;margin:16px 0}
    .ps-emp-info{margin-bottom:20px}
    .ps-info-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;background:var(--bg-secondary);padding:16px;border-radius:var(--radius-sm)}
    .ps-label{display:block;font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:600;margin-bottom:2px}
    .ps-body{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px}
    .ps-col h4{font-size:12px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);font-weight:700;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid var(--border)}
    .ps-row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid var(--border);color:var(--text-secondary);font-size:13px;&.bonus span:last-child{color:var(--success)}&.deduct span:last-child{color:var(--danger)}}
    .ps-total{display:flex;justify-content:space-between;padding:10px 0;font-size:13px;font-weight:600;border-top:2px solid var(--border-light);margin-top:4px;&.deduct strong{color:var(--danger)}}
    .ps-net{background:linear-gradient(135deg,var(--accent),var(--accent-dark));border-radius:var(--radius-sm);padding:20px 24px;display:flex;justify-content:space-between;align-items:center;color:#fff;margin-bottom:20px;span{font-size:14px;font-weight:700;letter-spacing:1px;opacity:.9}strong{font-size:28px;font-weight:900}}
    .ps-footer{text-align:center;p{color:var(--text-muted);font-size:11px;margin:2px 0}}
  `]
})
export class PayslipDialogComponent {
  months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  today = new Date();
  constructor(public dialogRef: MatDialogRef<PayslipDialogComponent>, @Inject(MAT_DIALOG_DATA) public p: any) {}
  print() { window.print(); }
}
