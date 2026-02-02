import { Routes } from '@angular/router';
import { projectResolver, projectsResolver } from '../../core/resolvers';

export const projectsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./projects/projects.component').then((m) => m.ProjectsComponent),
    data: { title: 'Projects' },
    resolve: { projects: projectsResolver },
  },
  {
    path: ':projectId',
    loadComponent: () =>
      import('./projects/projects.component').then((m) => m.ProjectsComponent),
    data: { title: 'Projects' },
    resolve: { projects: projectsResolver },
  },
  {
    path: ':projectId/board',
    loadComponent: () => import('../board/board.component').then((m) => m.BoardComponent),
    data: { title: 'Project Board' },
    resolve: { project: projectResolver },
  },
];
