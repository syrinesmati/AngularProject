import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot } from '@angular/router';
import { Project } from '../models/project.model';
import { ProjectsService } from '../services/projects.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * ProjectResolver - Pre-loads project data before route activation
 * Used for: /projects/:projectId and child routes
 *
 * Benefits:
 * - Project data is ready when component initializes
 * - No loading state needed in component
 * - Route guard can verify user membership before loading
 */
export const projectResolver: ResolveFn<Project | null> = (
  route: ActivatedRouteSnapshot
) => {
  const projectsService = inject(ProjectsService);
  const projectId = route.paramMap.get('projectId');

  if (!projectId) {
    console.error('No projectId provided to resolver');
    return of(null);
  }

  return projectsService.getProjectById(projectId).pipe(
    catchError((error) => {
      console.error('Failed to load project:', error);
      return of(null);
    })
  );
};
