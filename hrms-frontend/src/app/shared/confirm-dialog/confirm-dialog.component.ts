import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-icon"><mat-icon color="warn">warning</mat-icon></div>
      <h2>{{data.title}}</h2>
      <p>{{data.message}}</p>
      <div class="confirm-actions">
        <button mat-button (click)="dialogRef.close(false)">Cancel</button>
        <button mat-raised-button color="warn" (click)="dialogRef.close(true)" id="confirm-yes-btn">{{data.confirmText || 'Confirm'}}</button>
      </div>
    </div>
  `,
  styles: [`.confirm-dialog{padding:32px;text-align:center;max-width:400px}.confirm-icon{margin-bottom:16px;mat-icon{font-size:48px;width:48px;height:48px}}h2{font-size:18px;font-weight:700;margin-bottom:8px}p{color:var(--text-muted);font-size:14px;margin-bottom:24px}.confirm-actions{display:flex;justify-content:center;gap:12px}`]
})
export class ConfirmDialogComponent {
  constructor(public dialogRef: MatDialogRef<ConfirmDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { title: string; message: string; confirmText?: string }) {}
}
