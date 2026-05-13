import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { EmployeeService } from '../../../core/services';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule, MatTabsModule, MatProgressSpinnerModule],
  template: `
    <div class="page-content fade-in-up" *ngIf="emp; else loading">
      <div class="page-header">
        <div style="display:flex;align-items:center;gap:16px">
          <button mat-icon-button routerLink="/employees"><mat-icon>arrow_back</mat-icon></button>
          <div>
            <h1>{{emp.fullName}}</h1>
            <div class="breadcrumb">{{emp.designationTitle}} · {{emp.departmentName}}</div>
          </div>
        </div>
        <span class="badge" [ngClass]="statusClass(emp.status)">{{emp.status}}</span>
      </div>

      <div class="detail-grid">
        <div class="card profile-card">
          <div class="profile-banner"></div>
          <div class="profile-body">
            <div class="profile-avatar">{{emp.fullName[0]}}</div>
            <h2>{{emp.fullName}}</h2>
            <p>{{emp.designationTitle}}</p>
            <span class="chip">{{emp.employeeCode}}</span>
          </div>
          <div class="profile-info">
            <div class="info-row"><mat-icon>email</mat-icon><div><div class="info-label">Email</div><div>{{emp.email}}</div></div></div>
            <div class="info-row"><mat-icon>phone</mat-icon><div><div class="info-label">Phone</div><div>{{emp.phoneNumber}}</div></div></div>
            <div class="info-row"><mat-icon>business</mat-icon><div><div class="info-label">Department</div><div>{{emp.departmentName}}</div></div></div>
            <div class="info-row"><mat-icon>work</mat-icon><div><div class="info-label">Designation</div><div>{{emp.designationTitle}}</div></div></div>
            <div class="info-row"><mat-icon>calendar_today</mat-icon><div><div class="info-label">Joining Date</div><div>{{emp.joiningDate | date:'mediumDate'}}</div></div></div>
            <div class="info-row"><mat-icon>wc</mat-icon><div><div class="info-label">Gender</div><div>{{emp.gender}}</div></div></div>
          </div>
        </div>

        <div class="card detail-card">
          <mat-tab-group>
            <mat-tab label="Personal Info">
              <div class="tab-content">
                <div class="detail-row"><span class="dl">Date of Birth</span><span>{{emp.dateOfBirth | date:'mediumDate'}}</span></div>
                <div class="detail-row"><span class="dl">National ID</span><span>{{emp.nationalId || '—'}}</span></div>
                <div class="detail-row"><span class="dl">Address</span><span>{{emp.address || '—'}}</span></div>
                <div class="detail-row"><span class="dl">Emergency Contact</span><span>{{emp.emergencyContact || '—'}}</span></div>
              </div>
            </mat-tab>
            <mat-tab label="Bank & Salary">
              <div class="tab-content">
                <div class="detail-row"><span class="dl">Bank Account</span><span>{{emp.bankAccountNumber || '—'}}</span></div>
                <div class="detail-row"><span class="dl">Salary</span>
                  <a [routerLink]="['/salary', emp.id]" style="color:var(--accent-light)">View Salary Details →</a>
                </div>
              </div>
            </mat-tab>
          </mat-tab-group>
        </div>
      </div>
    </div>
    <ng-template #loading><div class="loading-overlay" style="height:80vh"><mat-spinner diameter="40"></mat-spinner></div></ng-template>
  `,
  styles: [`
    .detail-grid{display:grid;grid-template-columns:300px 1fr;gap:20px}
    .profile-card{overflow:visible}
    .profile-banner{height:80px;background:linear-gradient(135deg,var(--accent),var(--accent-dark))}
    .profile-body{text-align:center;padding:0 20px 20px;border-bottom:1px solid var(--border)}
    .profile-avatar{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--accent),var(--accent-dark));display:flex;align-items:center;justify-content:center;font-weight:800;font-size:26px;color:#fff;margin:-36px auto 12px;border:4px solid var(--bg-card)}
    .profile-body h2{font-size:18px;font-weight:700}
    .profile-body p{color:var(--text-muted);font-size:13px;margin:4px 0 10px}
    .profile-info{padding:16px}
    .info-row{display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;mat-icon{color:var(--accent-light);font-size:18px;width:18px;margin-top:2px}}
    .info-label{font-size:11px;color:var(--text-muted);text-transform:uppercase;font-weight:600;margin-bottom:2px}
    .tab-content{padding:20px}
    .detail-row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid var(--border);font-size:14px}
    .dl{color:var(--text-muted);font-weight:500}
    @media(max-width:768px){.detail-grid{grid-template-columns:1fr}}
  `]
})
export class EmployeeDetailComponent implements OnInit {
  emp: any;
  constructor(private route: ActivatedRoute, private empSvc: EmployeeService) {}
  ngOnInit() { this.empSvc.getById(+this.route.snapshot.params['id']).subscribe({ next: e => this.emp = e }); }
  statusClass(s: string) { return { 'badge-success': s==='Active', 'badge-warning': s==='Inactive', 'badge-danger': s==='Terminated', 'badge-muted': s==='Resigned' }; }
}
