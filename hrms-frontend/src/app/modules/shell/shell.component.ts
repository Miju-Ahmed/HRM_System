import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../core/auth.service';
import { NotificationService } from '../../core/services';

interface NavItem { icon: string; label: string; route: string; roles?: string[]; }

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatListModule, MatIconModule, MatButtonModule, MatMenuModule, MatBadgeModule, MatDividerModule, MatTooltipModule],
  template: `
    <div class="shell-wrapper">
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed">
        <div class="sidebar-logo">
          <mat-icon class="logo-icon">corporate_fare</mat-icon>
          <span class="logo-text" *ngIf="!sidebarCollapsed">AIUB HRMS</span>
        </div>
        <nav class="sidebar-nav">
          <ng-container *ngFor="let item of visibleNavItems">
            <a class="nav-item" [routerLink]="item.route" routerLinkActive="active" [matTooltip]="sidebarCollapsed ? item.label : ''" matTooltipPosition="right">
              <mat-icon>{{item.icon}}</mat-icon>
              <span *ngIf="!sidebarCollapsed">{{item.label}}</span>
            </a>
          </ng-container>
        </nav>
        <div class="sidebar-footer" *ngIf="!sidebarCollapsed">
          <div class="user-info">
            <div class="avatar">{{initials}}</div>
            <div>
              <div class="user-name">{{user?.fullName}}</div>
              <div class="user-role">{{user?.role}}</div>
            </div>
          </div>
        </div>
      </aside>

      <div class="main-wrapper">
        <header class="topbar">
          <button mat-icon-button (click)="sidebarCollapsed=!sidebarCollapsed" id="toggle-sidebar">
            <mat-icon>{{sidebarCollapsed ? 'menu' : 'menu_open'}}</mat-icon>
          </button>
          <span class="topbar-spacer"></span>
          <button mat-icon-button [matMenuTriggerFor]="notifMenu" id="notifications-btn">
            <mat-icon [matBadge]="unreadCount > 0 ? unreadCount : null" matBadgeColor="warn">notifications</mat-icon>
          </button>
          <mat-menu #notifMenu="matMenu" class="notif-menu">
            <div class="notif-header"><span>Notifications</span><button mat-button (click)="markAllRead()">Mark all read</button></div>
            <div *ngIf="notifications.length === 0" class="notif-empty">No notifications</div>
            <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.isRead" (click)="markRead(n)">
              <div class="notif-title">{{n.title}}</div>
              <div class="notif-msg">{{n.message}}</div>
            </div>
          </mat-menu>
          <button mat-icon-button [matMenuTriggerFor]="userMenu" id="user-menu-btn">
            <div class="topbar-avatar">{{initials}}</div>
          </button>
          <mat-menu #userMenu="matMenu">
            <button mat-menu-item routerLink="/settings"><mat-icon>settings</mat-icon>Settings</button>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="logout()" id="logout-btn"><mat-icon>logout</mat-icon>Sign Out</button>
          </mat-menu>
        </header>
        <main class="main-content"><router-outlet /></main>
      </div>
    </div>
  `,
  styles: [`
    .shell-wrapper { display: flex; height: 100vh; overflow: hidden; background: var(--bg-primary); }
    .sidebar { width: 260px; background: var(--bg-sidebar); border-right: 1px solid var(--border); display: flex; flex-direction: column; transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1); overflow: hidden; flex-shrink: 0; box-shadow: 4px 0 24px rgba(0,0,0,0.1); z-index: 10; &.collapsed { width: 72px; } }
    .sidebar-logo { display: flex; align-items: center; gap: 14px; padding: 24px 20px; border-bottom: 1px solid var(--border); height: 72px; .logo-icon { color: var(--accent-light); font-size: 32px; width: 32px; height: 32px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; } .logo-text { font-size: 18px; font-weight: 800; color: #fff; white-space: nowrap; letter-spacing: 0.5px; } }
    .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; }
    .nav-item { display: flex; align-items: center; gap: 16px; padding: 12px 14px; text-decoration: none; color: var(--text-secondary); border-radius: 8px; transition: all 0.2s ease; cursor: pointer; white-space: nowrap; font-size: 14px; font-weight: 500; height: 48px; mat-icon { font-size: 22px; width: 22px; height: 22px; flex-shrink: 0; transition: color 0.2s ease; display: flex; align-items: center; justify-content: center; } &:hover { background: var(--bg-card-hover); color: var(--text-primary); mat-icon { color: var(--text-primary); } } &.active { background: linear-gradient(90deg, rgba(99,102,241,0.15), transparent); color: var(--accent-light); border-left: 3px solid var(--accent); mat-icon { color: var(--accent-light); } } }
    .sidebar-footer { padding: 16px; border-top: 1px solid var(--border); background: rgba(0,0,0,0.1); }
    .user-info { display: flex; align-items: center; gap: 12px; }
    .avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-dark)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0; box-shadow: 0 4px 10px rgba(99,102,241,0.3); }
    .user-name { font-size: 14px; font-weight: 600; color: var(--text-primary); line-height: 1.2; }
    .user-role { font-size: 12px; color: var(--text-muted); margin-top: 2px; }
    .main-wrapper { flex: 1; display: flex; flex-direction: column; overflow: hidden; position: relative; }
    .topbar { height: 72px; background: rgba(17, 24, 39, 0.8); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); display: flex; align-items: center; padding: 0 24px; gap: 12px; flex-shrink: 0; position: sticky; top: 0; z-index: 5; button { color: var(--text-secondary); transition: color 0.2s; &:hover { color: var(--text-primary); } } }
    .topbar-spacer { flex: 1; }
    .topbar-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--accent), var(--accent-dark)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; color: #fff; cursor: pointer; transition: transform 0.2s; &:hover { transform: scale(1.05); } }
    .main-content { flex: 1; overflow-y: auto; padding-bottom: 24px; }
    .notif-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; font-weight: 600; border-bottom: 1px solid var(--border); color: var(--text-primary); }
    .notif-empty { padding: 32px 20px; text-align: center; color: var(--text-muted); font-size: 14px; }
    .notif-item { padding: 14px 20px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s; &.unread { background: rgba(99,102,241,0.08); border-left: 2px solid var(--accent); } &:hover { background: var(--bg-card-hover); } .notif-title { font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; } .notif-msg { font-size: 13px; color: var(--text-muted); line-height: 1.4; } }
  `]
})
export class ShellComponent implements OnInit {
  sidebarCollapsed = false;
  notifications: any[] = [];
  unreadCount = 0;

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/dashboard' },
    { icon: 'people', label: 'Employees', route: '/employees', roles: ['Admin','HR'] },
    { icon: 'business', label: 'Departments', route: '/departments', roles: ['Admin','HR'] },
    { icon: 'account_balance_wallet', label: 'Salary', route: '/salary', roles: ['Admin','HR'] },
    { icon: 'receipt_long', label: 'Payroll', route: '/payroll', roles: ['Admin','HR'] },
    { icon: 'schedule', label: 'Attendance', route: '/attendance' },
    { icon: 'beach_access', label: 'Leave', route: '/leave' },
    { icon: 'assessment', label: 'Reports', route: '/reports', roles: ['Admin','HR'] },
    { icon: 'settings', label: 'Settings', route: '/settings' },
  ];

  constructor(public auth: AuthService, private notifSvc: NotificationService) {}

  get user() { return this.auth.currentUser; }
  get initials() { return this.user?.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'; }
  get visibleNavItems() {
    const role = this.user?.role;
    return this.navItems.filter(i => !i.roles || i.roles.includes(role!));
  }

  ngOnInit() { this.loadNotifications(); }

  loadNotifications() {
    this.notifSvc.getAll().subscribe({ next: (d: any[]) => { this.notifications = d.slice(0, 10); this.unreadCount = d.filter(n => !n.isRead).length; }, error: () => {} });
  }

  markRead(n: any) { if (!n.isRead) { n.isRead = true; this.unreadCount = Math.max(0, this.unreadCount - 1); this.notifSvc.markRead(n.id).subscribe(); } }
  markAllRead() { this.notifications.forEach(n => n.isRead = true); this.unreadCount = 0; this.notifSvc.markAllRead().subscribe(); }
  logout() { this.auth.logout(); }
}
