/**
 * Resolvers Index
 * Centralized export point for all route resolvers
 *
 * Usage in routes:
 * resolve: { project: projectResolver }
 * resolve: { projects: projectsResolver }
 * resolve: { user: userResolver }
 */

export { projectResolver } from './project.resolver';
export { projectsResolver } from './projects.resolver';
export { userResolver } from './user.resolver';
