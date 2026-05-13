import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-content fade-in-up">
      <div class="page-header">
        <div><h1>Settings</h1><div class="breadcrumb">Manage your account preferences</div></div>
      </div>

      <div class="settings-grid">
        <div class="card">
          <div class="card-header"><h3>Account Profile</h3></div>
          <div class="settings-body">
            <div class="profile-preview">
              <div class="avatar-lg">{{initials}}</div>
              <div class="profile-info">
                <h2>{{auth.currentUser?.fullName}}</h2>
                <p>{{auth.currentUser?.email}}</p>
                <span class="badge badge-info">{{auth.currentUser?.role}}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header"><h3>Change Password</h3></div>
          <div class="settings-body">
            <form [formGroup]="pwdForm" (ngSubmit)="changePwd()" style="display:flex;flex-direction:column;gap:12px">
              <mat-form-field appearance="outline">
                <mat-label>Current Password</mat-label>
                <input matInput formControlName="currentPassword" [type]="showP1?'text':'password'" id="current-password">
                <button type="button" mat-icon-button matSuffix (click)="showP1=!showP1"><mat-icon>{{showP1?'visibility_off':'visibility'}}</mat-icon></button>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>New Password</mat-label>
                <input matInput formControlName="newPassword" [type]="showP2?'text':'password'" id="new-password">
                <button type="button" mat-icon-button matSuffix (click)="showP2=!showP2"><mat-icon>{{showP2?'visibility_off':'visibility'}}</mat-icon></button>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Confirm New Password</mat-label>
                <input matInput formControlName="confirmPassword" [type]="showP3?'text':'password'" id="confirm-password">
                <button type="button" mat-icon-button matSuffix (click)="showP3=!showP3"><mat-icon>{{showP3?'visibility_off':'visibility'}}</mat-icon></button>
              </mat-form-field>

              <div *ngIf="error" class="error-msg"><mat-icon>error</mat-icon>{{error}}</div>

              <button mat-raised-button class="btn-primary" type="submit" [disabled]="pwdForm.invalid || loading" style="align-self:flex-start" id="change-password-btn">
                <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
                <span *ngIf="!loading">Update Password</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-grid { display: grid; grid-template-columns: 1fr; gap: 20px; max-width: 600px; }
    .settings-body { padding: 24px; }
    .profile-preview { display: flex; align-items: center; gap: 20px; }
    .avatar-lg { width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-dark)); display: flex; align-items: center; justify-content: center; font-size: 32px; font-weight: 800; color: #fff; }
    .profile-info h2 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .profile-info p { color: var(--text-muted); font-size: 14px; margin-bottom: 12px; }
    .error-msg { display: flex; align-items: center; gap: 6px; color: var(--danger); font-size: 13px; margin-bottom: 8px; mat-icon { font-size: 18px; width: 18px; } }
  `]
})
export class SettingsComponent {
  pwdForm: any;
  loading = false; error = '';
  showP1 = false; showP2 = false; showP3 = false;

  get initials() { return this.auth.currentUser?.fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || 'U'; }

  constructor(public auth: AuthService, private fb: FormBuilder, private snack: MatSnackBar) {
    this.pwdForm = this.fb.group({ currentPassword: ['', Validators.required], newPassword: ['', [Validators.required, Validators.minLength(6)]], confirmPassword: ['', Validators.required] }, { validator: this.pwdMatch });
  }

  pwdMatch(g: any) { return g.get('newPassword').value === g.get('confirmPassword').value ? null : { mismatch: true }; }

  changePwd() {
    if (this.pwdForm.invalid) {
      if (this.pwdForm.errors?.['mismatch']) this.error = 'New passwords do not match';
      return;
    }
    this.loading = true; this.error = '';
    this.auth.changePassword(this.pwdForm.value).subscribe({
      next: () => { this.snack.open('Password updated successfully', '×', { duration: 3000 }); this.pwdForm.reset(); this.loading = false; },
      error: (e: any) => { this.error = e?.error?.message || e?.error?.[0]?.description || 'Failed to update password'; this.loading = false; }
    });
  }
}
