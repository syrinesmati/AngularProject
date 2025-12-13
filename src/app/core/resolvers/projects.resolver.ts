import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Project } from '../models/project.model';
import { ProjectsService } from '../services/projects.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

/**
 * ProjectsResolver - Pre-loads list of projects before route activation
 * Used for: /projects (list page)
 *
 * Benefits:
 * - Projects list is ready when component initializes
 * - Prevents empty state on first load
 * - Can display data immediately
 */
export const projectsResolver: ResolveFn<Project[] | null> = () => {
  const projectsService = inject(ProjectsService);

  return projectsService.getAllProjects().pipe(
    catchError((error) => {
      console.error('Failed to load projects:', error);
      return of(null);
    })
  );
};
