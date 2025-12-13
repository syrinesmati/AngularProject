import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { projectMemberGuard } from './core/guards/project-member.guard';

export const routes: Routes = [
  // ============================================
  // PUBLIC ROUTES - Auth Feature (Person 3)
  // ============================================
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/pages/login/login.component').then(
            (m) => m.LoginComponent
          ),
        data: { title: 'Login' },
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/pages/register/register.component').then(
            (m) => m.RegisterComponent
          ),
        data: { title: 'Register' },
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/pages/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent
          ),
        data: { title: 'Forgot Password' },
      },
    ],
  },

  // ============================================
  // PROTECTED ROUTES - Projects Feature (Person 4)
  // ============================================
  {
    path: 'projects',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/projects/pages/projects-list/projects-list.component').then(
            (m) => m.ProjectsListComponent
          ),
        data: { title: 'Projects' },
      },
      {
        path: 'create',
        loadComponent: () =>
          import('./features/projects/pages/project-create/project-create.component').then(
            (m) => m.ProjectCreateComponent
          ),
        data: { title: 'Create Project' },
      },
      {
        path: ':projectId',
        canActivate: [projectMemberGuard],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/projects/pages/project-board/project-board.component').then(
                (m) => m.ProjectBoardComponent
              ),
            data: { title: 'Project Board' },
            // resolve: { project: ProjectResolver } // TODO: Create in Task 4
          },
          {
            path: 'tasks',
            loadComponent: () =>
              import('./features/projects/pages/project-tasks/project-tasks.component').then(
                (m) => m.ProjectTasksComponent
              ),
            data: { title: 'Tasks' },
          },
          {
            path: 'members',
            loadComponent: () =>
              import('./features/projects/pages/project-members/project-members.component').then(
                (m) => m.ProjectMembersComponent
              ),
            data: { title: 'Members' },
          },
          {
            path: 'settings',
            loadComponent: () =>
              import('./features/projects/pages/project-settings/project-settings.component').then(
                (m) => m.ProjectSettingsComponent
              ),
            data: { title: 'Project Settings' },
          },
        ],
      },
    ],
  },

  // ============================================
  // PROTECTED ROUTES - Tasks Feature (Person 5)
  // ============================================
  {
    path: 'tasks',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/tasks/pages/tasks-list/tasks-list.component').then(
            (m) => m.TasksListComponent
          ),
        data: { title: 'My Tasks' },
      },
      {
        path: ':taskId',
        loadComponent: () =>
          import('./features/tasks/pages/task-detail/task-detail.component').then(
            (m) => m.TaskDetailComponent
          ),
        data: { title: 'Task Detail' },
        // resolve: { task: TaskResolver } // TODO: Create in Task 4
      },
    ],
  },

  // ============================================
  // PROTECTED ROUTES - Reports Feature (Person 6)
  // ============================================
  {
    path: 'reports',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/reports/pages/reports-dashboard/reports-dashboard.component').then(
            (m) => m.ReportsDashboardComponent
          ),
        data: { title: 'Reports' },
      },
      {
        path: 'project/:projectId',
        loadComponent: () =>
          import('./features/reports/pages/project-report/project-report.component').then(
            (m) => m.ProjectReportComponent
          ),
        data: { title: 'Project Report' },
      },
    ],
  },

  // ============================================
  // PROTECTED ROUTES - Team Feature
  // ============================================
  {
    path: 'team',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/team/pages/team-list/team-list.component').then(
            (m) => m.TeamListComponent
          ),
        data: { title: 'Team' },
      },
      {
        path: ':teamId',
        loadComponent: () =>
          import('./features/team/pages/team-detail/team-detail.component').then(
            (m) => m.TeamDetailComponent
          ),
        data: { title: 'Team Detail' },
      },
    ],
  },

  // ============================================
  // PROTECTED ROUTES - Settings Feature
  // ============================================
  {
    path: 'settings',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'profile',
        pathMatch: 'full',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/settings/pages/profile-settings/profile-settings.component').then(
            (m) => m.ProfileSettingsComponent
          ),
        data: { title: 'Profile Settings' },
      },
      {
        path: 'preferences',
        loadComponent: () =>
          import('./features/settings/pages/preferences/preferences.component').then(
            (m) => m.PreferencesComponent
          ),
        data: { title: 'Preferences' },
      },
      {
        path: 'security',
        loadComponent: () =>
          import('./features/settings/pages/security/security.component').then(
            (m) => m.SecurityComponent
          ),
        data: { title: 'Security' },
      },
    ],
  },

  // ============================================
  // ADMIN ROUTES
  // ============================================
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/admin/pages/admin-dashboard/admin-dashboard.component').then(
            (m) => m.AdminDashboardComponent
          ),
        data: { title: 'Admin Dashboard' },
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/pages/users-management/users-management.component').then(
            (m) => m.UsersManagementComponent
          ),
        data: { title: 'User Management' },
      },
      {
        path: 'activity',
        loadComponent: () =>
          import('./features/admin/pages/activity-logs/activity-logs.component').then(
            (m) => m.ActivityLogsComponent
          ),
        data: { title: 'Activity Logs' },
      },
    ],
  },

  // ============================================
  // FALLBACK ROUTES
  // ============================================
  {
    path: '',
    redirectTo: 'projects',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
    data: { title: 'Page Not Found' },
  },
];
