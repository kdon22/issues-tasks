/**
 * Issue numbering utilities for project-based identifiers
 * Handles the transition from team-based to project-based issue numbering
 */

interface Project {
  id: string;
  identifier: string; // This will become the "key" field
  name: string;
}

interface Issue {
  id: string;
  identifier: string;
  number: number;
  projectId?: string;
  teamId: string;
  project?: Project;
}

/**
 * Generate a display identifier for an issue based on project key
 * @param project - The project object
 * @param issueNumber - The sequential issue number
 * @returns Display identifier like "MOB-123"
 */
export function generateIssueIdentifier(project: Project, issueNumber: number): string {
  return `${project.identifier}-${issueNumber}`;
}

/**
 * Parse an issue identifier to extract project key and number
 * @param identifier - Issue identifier like "MOB-123"
 * @returns Object with project key and issue number
 */
export function parseIssueIdentifier(identifier: string): { projectKey: string; issueNumber: number } | null {
  const match = identifier.match(/^([A-Z0-9-]+)-(\d+)$/);
  if (!match) return null;
  
  return {
    projectKey: match[1],
    issueNumber: parseInt(match[2], 10)
  };
}

/**
 * Get the next issue number for a project
 * @param projectId - The project ID
 * @param existingIssues - Array of existing issues for the project
 * @returns Next available issue number
 */
export function getNextIssueNumber(projectId: string, existingIssues: Issue[]): number {
  const projectIssues = existingIssues.filter(issue => issue.projectId === projectId);
  const maxNumber = Math.max(0, ...projectIssues.map(issue => issue.number));
  return maxNumber + 1;
}

/**
 * Update issue identifier when project key changes
 * @param oldProjectKey - Previous project key
 * @param newProjectKey - New project key
 * @param issueNumber - Issue number
 * @returns New identifier
 */
export function updateIssueIdentifier(oldProjectKey: string, newProjectKey: string, issueNumber: number): string {
  return `${newProjectKey}-${issueNumber}`;
}

/**
 * Validate project key format
 * @param key - Project key to validate
 * @returns True if valid, false otherwise
 */
export function isValidProjectKey(key: string): boolean {
  return /^[A-Z0-9-]{2,10}$/.test(key);
}

/**
 * Generate a project key from project name if none provided
 * @param projectName - The project name
 * @returns Suggested project key
 */
export function generateProjectKey(projectName: string): string {
  return projectName
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '') // Remove special chars except spaces
    .split(/\s+/) // Split on whitespace
    .map(word => word.substring(0, 3)) // Take first 3 chars of each word
    .join('')
    .substring(0, 6); // Limit to 6 characters
}

/**
 * Format issue for display with project-based identifier
 * @param issue - Issue object
 * @returns Formatted issue with display identifier
 */
export function formatIssueForDisplay(issue: Issue & { project?: Project }): Issue & { displayIdentifier: string } {
  const displayIdentifier = issue.project 
    ? generateIssueIdentifier(issue.project, issue.number)
    : issue.identifier; // Fallback to existing identifier
    
  return {
    ...issue,
    displayIdentifier
  };
} 