import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="login-wrapper">
      <div class="login-bg">
        <div class="orb orb1"></div><div class="orb orb2"></div><div class="orb orb3"></div>
      </div>
      <div class="login-card fade-in-up">
        <div class="login-header">
          <div class="logo"><mat-icon>corporate_fare</mat-icon></div>
          <h1>AIUB HRMS</h1>
          <p>Human Resource Management System</p>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <mat-form-field appearance="outline">
            <mat-label>Email Address</mat-label>
            <input matInput formControlName="email" type="email" placeholder="admin&#64;hrms.com" id="login-email">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Password</mat-label>
            <input matInput formControlName="password" [type]="showPwd ? 'text' : 'password'" id="login-password">
            <mat-icon matPrefix>lock</mat-icon>
            <button type="button" mat-icon-button matSuffix (click)="showPwd=!showPwd">
              <mat-icon>{{ showPwd ? 'visibility_off' : 'visibility' }}</mat-icon>
            </button>
          </mat-form-field>
          <div *ngIf="error" class="error-msg"><mat-icon>error</mat-icon> {{ error }}</div>
          <button mat-raised-button class="btn-primary login-btn" type="submit" [disabled]="loading || form.invalid" id="login-submit">
            <mat-spinner *ngIf="loading" diameter="18"></mat-spinner>
            <span *ngIf="!loading">Sign In</span>
          </button>
        </form>
        <div class="demo-creds">
          <p>Demo Credentials:</p>
          <div class="creds-list">
            <span class="cred-chip"><strong>Admin:</strong> admin&#64;hrms.com / Admin&#64;123</span>
            <span class="cred-chip"><strong>HR:</strong> farida&#64;hrms.com / Hr&#64;123456</span>
            <span class="cred-chip"><strong>Employee:</strong> rahim&#64;hrms.com / Emp&#64;123456</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-primary); position: relative; overflow: hidden; }
    .login-bg { position: absolute; inset: 0; pointer-events: none; }
    .orb { position: absolute; border-radius: 50%; filter: blur(100px); opacity: 0.15; }
    .orb1 { width: 600px; height: 600px; background: var(--accent); top: -200px; left: -200px; }
    .orb2 { width: 400px; height: 400px; background: var(--info); bottom: -100px; right: -100px; }
    .orb3 { width: 300px; height: 300px; background: var(--success); bottom: 100px; left: 50%; }
    .login-card { background: rgba(26,34,53,0.8); backdrop-filter: blur(20px); border: 1px solid var(--border-light); border-radius: 20px; padding: 48px 40px; width: 100%; max-width: 440px; position: relative; z-index: 1; }
    .login-header { text-align: center; margin-bottom: 36px; }
    .logo { width: 64px; height: 64px; background: linear-gradient(135deg, var(--accent), var(--accent-dark)); border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; mat-icon { font-size: 32px; width: 32px; height: 32px; color: #fff; } }
    h1 { font-size: 26px; font-weight: 800; color: var(--text-primary); margin-bottom: 6px; }
    p { color: var(--text-muted); font-size: 13px; }
    mat-form-field { width: 100%; margin-bottom: 8px; }
    .error-msg { display: flex; align-items: center; gap: 6px; color: var(--danger); font-size: 13px; margin-bottom: 12px; mat-icon { font-size: 18px; width: 18px; height: 18px; } }
    .login-btn { width: 100%; height: 48px; font-size: 15px; font-weight: 700; letter-spacing: 0.5px; margin-top: 8px; display: flex; align-items: center; justify-content: center; gap: 8px; }
    .demo-creds { margin-top: 28px; padding-top: 20px; border-top: 1px solid var(--border); p { text-align: center; font-size: 12px; color: var(--text-muted); margin-bottom: 10px; } }
    .creds-list { display: flex; flex-direction: column; gap: 6px; }
    .cred-chip { background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 8px; padding: 6px 12px; font-size: 11px; color: var(--text-muted); strong { color: var(--text-secondary); } }
  `]
})
export class LoginComponent {
  form = this.fb.group({ email: ['', [Validators.required, Validators.email]], password: ['', Validators.required] });
  loading = false; error = ''; showPwd = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  submit() {
    if (this.form.invalid) return;
    this.loading = true; this.error = '';
    const { email, password } = this.form.value;
    this.auth.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => { this.error = e?.error?.message || 'Login failed. Check your credentials.'; this.loading = false; }
    });
  }
}
