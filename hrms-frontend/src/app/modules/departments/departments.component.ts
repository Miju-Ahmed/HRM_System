import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { DepartmentService } from '../../core/services';
import { AuthService } from '../../core/auth.service';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatTabsModule, MatFormFieldModule,
    MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule],
  template: `
    <div class="page-content fade-in-up">
      <div class="page-header">
        <div><h1>Departments & Designations</h1><div class="breadcrumb">Manage org structure</div></div>
      </div>
      <mat-tab-group>
        <!-- Departments Tab -->
        <mat-tab label="Departments">
          <div class="tab-outer">
            <div class="side-form card" *ngIf="auth.isAdminOrHR">
              <div class="card-header"><h3>{{editingDept ? 'Edit' : 'New'}} Department</h3></div>
              <form [formGroup]="deptForm" (ngSubmit)="saveDept()" style="padding:20px;display:flex;flex-direction:column;gap:12px">
                <mat-form-field appearance="outline"><mat-label>Name</mat-label><input matInput formControlName="name" id="dept-name"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="2"></textarea></mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Parent Department (optional)</mat-label>
                  <mat-select formControlName="parentDepartmentId">
                    <mat-option [value]="null">None</mat-option>
                    <mat-option *ngFor="let d of departments" [value]="d.id">{{d.name}}</mat-option>
                  </mat-select>
                </mat-form-field>
                <div style="display:flex;gap:8px">
                  <button mat-raised-button class="btn-primary" type="submit" [disabled]="deptForm.invalid||savingDept">{{editingDept ? 'Update' : 'Create'}}</button>
                  <button *ngIf="editingDept" mat-button type="button" (click)="cancelDept()">Cancel</button>
                </div>
              </form>
            </div>
            <div class="dept-list">
              <div *ngFor="let d of departments" class="dept-card card">
                <div class="dept-card-header">
                  <div>
                    <h3>{{d.name}}</h3>
                    <p>{{d.description || 'No description'}}</p>
                    <div *ngIf="d.parentDepartmentName" class="chip" style="font-size:11px;margin-top:4px">↳ {{d.parentDepartmentName}}</div>
                  </div>
                  <div class="dept-actions" *ngIf="auth.isAdminOrHR">
                    <span class="badge badge-info">{{d.employeeCount}} employees</span>
                    <button mat-icon-button (click)="editDept(d)"><mat-icon>edit</mat-icon></button>
                    <button *ngIf="auth.isAdmin" mat-icon-button color="warn" (click)="deleteDept(d)"><mat-icon>delete</mat-icon></button>
                  </div>
                </div>
              </div>
              <div *ngIf="departments.length===0" class="empty-state"><mat-icon>business</mat-icon><h3>No departments yet</h3></div>
            </div>
          </div>
        </mat-tab>

        <!-- Designations Tab -->
        <mat-tab label="Designations">
          <div class="tab-outer">
            <div class="side-form card" *ngIf="auth.isAdminOrHR">
              <div class="card-header"><h3>{{editingDesig ? 'Edit' : 'New'}} Designation</h3></div>
              <form [formGroup]="desigForm" (ngSubmit)="saveDesig()" style="padding:20px;display:flex;flex-direction:column;gap:12px">
                <mat-form-field appearance="outline"><mat-label>Title</mat-label><input matInput formControlName="title" id="desig-title"></mat-form-field>
                <mat-form-field appearance="outline"><mat-label>Description</mat-label><textarea matInput formControlName="description" rows="2"></textarea></mat-form-field>
                <mat-form-field appearance="outline">
                  <mat-label>Department</mat-label>
                  <mat-select formControlName="departmentId">
                    <mat-option *ngFor="let d of departments" [value]="d.id">{{d.name}}</mat-option>
                  </mat-select>
                </mat-form-field>
                <div style="display:flex;gap:8px">
                  <button mat-raised-button class="btn-primary" type="submit" [disabled]="desigForm.invalid">{{editingDesig ? 'Update' : 'Create'}}</button>
                  <button *ngIf="editingDesig" mat-button type="button" (click)="cancelDesig()">Cancel</button>
                </div>
              </form>
            </div>
            <div class="dept-list">
              <div *ngFor="let d of designations" class="dept-card card">
                <div class="dept-card-header">
                  <div><h3>{{d.title}}</h3><p>{{d.departmentName}}</p></div>
                  <div class="dept-actions" *ngIf="auth.isAdminOrHR">
                    <span class="badge badge-info">{{d.employeeCount}} employees</span>
                    <button mat-icon-button (click)="editDesig(d)"><mat-icon>edit</mat-icon></button>
                    <button *ngIf="auth.isAdmin" mat-icon-button color="warn" (click)="deleteDesig(d)"><mat-icon>delete</mat-icon></button>
                  </div>
                </div>
              </div>
              <div *ngIf="designations.length===0" class="empty-state"><mat-icon>work_outline</mat-icon><h3>No designations yet</h3></div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .tab-outer{display:grid;grid-template-columns:320px 1fr;gap:20px;padding-top:20px}
    .side-form{}
    .dept-list{display:flex;flex-direction:column;gap:12px}
    .dept-card{padding:0}
    .dept-card-header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;h3{font-size:15px;font-weight:600;margin-bottom:4px}p{font-size:12px;color:var(--text-muted)}}
    .dept-actions{display:flex;align-items:center;gap:4px}
    @media(max-width:900px){.tab-outer{grid-template-columns:1fr}}
  `]
})
export class DepartmentsComponent implements OnInit {
  departments: any[] = [];
  designations: any[] = [];
  deptForm: any; desigForm: any;
  editingDept: any = null; editingDesig: any = null;
  savingDept = false;

  constructor(public auth: AuthService, private deptSvc: DepartmentService, private dialog: MatDialog, private snack: MatSnackBar, private fb: FormBuilder) {}

  ngOnInit() {
    this.deptForm = this.fb.group({ name: ['', Validators.required], description: [''], parentDepartmentId: [null] });
    this.desigForm = this.fb.group({ title: ['', Validators.required], description: [''], departmentId: [null, Validators.required] });
    this.loadDepts(); this.loadDesigs();
  }

  loadDepts() { this.deptSvc.getAll().subscribe({ next: d => this.departments = d }); }
  loadDesigs() { this.deptSvc.getDesignations().subscribe({ next: d => this.designations = d }); }

  saveDept() {
    this.savingDept = true;
    const obs = this.editingDept ? this.deptSvc.update(this.editingDept.id, this.deptForm.value) : this.deptSvc.create(this.deptForm.value);
    obs.subscribe({ next: () => { this.snack.open('Saved!','×',{duration:2000}); this.deptForm.reset(); this.editingDept=null; this.savingDept=false; this.loadDepts(); }, error: ()=>this.savingDept=false });
  }

  editDept(d: any) { this.editingDept=d; this.deptForm.patchValue(d); }
  cancelDept() { this.editingDept=null; this.deptForm.reset(); }
  deleteDept(d: any) {
    this.dialog.open(ConfirmDialogComponent,{data:{title:'Delete Department',message:`Delete "${d.name}"?`}}).afterClosed().subscribe(ok=>{if(ok)this.deptSvc.delete(d.id).subscribe({next:()=>{this.snack.open('Deleted','×',{duration:2000});this.loadDepts();}});});
  }

  saveDesig() {
    const obs = this.editingDesig ? this.deptSvc.updateDesignation(this.editingDesig.id, this.desigForm.value) : this.deptSvc.createDesignation(this.desigForm.value);
    obs.subscribe({ next: () => { this.snack.open('Saved!','×',{duration:2000}); this.desigForm.reset(); this.editingDesig=null; this.loadDesigs(); } });
  }

  editDesig(d: any) { this.editingDesig=d; this.desigForm.patchValue({title:d.title,description:d.description,departmentId:d.departmentId}); }
  cancelDesig() { this.editingDesig=null; this.desigForm.reset(); }
  deleteDesig(d: any) {
    this.dialog.open(ConfirmDialogComponent,{data:{title:'Delete Designation',message:`Delete "${d.title}"?`}}).afterClosed().subscribe(ok=>{if(ok)this.deptSvc.deleteDesignation(d.id).subscribe({next:()=>{this.snack.open('Deleted','×',{duration:2000});this.loadDesigs();}});});
  }
}
