// API Usage Example -  (Shows DRY Power!)
'use client';

import { useState, useEffect } from 'react';
import { createActionClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function ApiExample() {
  const [issues, setIssues] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Create action client instance
  const client = createActionClient('demo-workspace');

  // Load data - same pattern for all resources!
  const loadData = async () => {
    setLoading(true);
    try {
      const [issuesRes, projectsRes, teamsRes] = await Promise.all([
        client.issue.list(),
        client.project.list(),
        client.team.list(),
      ]);

      setIssues(issuesRes.data || []);
      setProjects(projectsRes.data || []);
      setTeams(teamsRes.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create issue example
  const createIssue = async () => {
    try {
      const result = await client.issue.create({
        title: 'Test Issue',
        description: 'Created via API',
        priority: 'medium',
        status: 'backlog',
      });
      
      console.log('Issue created successfully');
      
      loadData(); // Refresh data
    } catch (error) {
      console.error('Failed to create issue:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">API Demo</h2>
        <div className="space-x-2">
          <Button onClick={loadData} variant="outline">
            Refresh Data
          </Button>
          <Button onClick={createIssue}>
            Create Test Issue
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Issues ({issues.length})</CardTitle>
            <CardDescription>
              Recent issues from API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {issues.map((issue) => (
                <div key={issue.id} className="p-2 bg-muted rounded">
                  <div className="font-medium">{issue.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {issue.status} • {issue.priority}
                  </div>
                </div>
              ))}
              {issues.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No issues found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Projects ({projects.length})</CardTitle>
            <CardDescription>
              Recent projects from API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id} className="p-2 bg-muted rounded">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {project.status}
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No projects found
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teams */}
        <Card>
          <CardHeader>
            <CardTitle>Teams ({teams.length})</CardTitle>
            <CardDescription>
              Recent teams from API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {teams.map((team) => (
                <div key={team.id} className="p-2 bg-muted rounded">
                  <div className="font-medium">{team.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {team.key}
                  </div>
                </div>
              ))}
              {teams.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  No teams found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🚀 DRY Magic Explanation</CardTitle>
          <CardDescription>
            How we built comprehensive APIs with minimal code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-orange-600">
                🎯 Traditional Approach: 300+ lines
              </h4>
              <p className="text-sm text-muted-foreground">
                Separate route files for each resource (issues, projects, teams) with repetitive CRUD operations
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-green-600">
                ✨ Our DRY Approach: 50 lines per resource
              </h4>
              <p className="text-sm text-muted-foreground">
                1 config file + 2 tiny route files = Complete CRUD API with auth, validation, pagination!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-muted p-3 rounded">
                <h5 className="font-medium">Issues API</h5>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>✅ GET /api/issues (with pagination)</li>
                  <li>✅ POST /api/issues (with validation)</li>
                  <li>✅ GET /api/issues/[id]</li>
                  <li>✅ PUT /api/issues/[id]</li>
                  <li>✅ DELETE /api/issues/[id]</li>
                </ul>
              </div>
              <div className="bg-muted p-3 rounded">
                <h5 className="font-medium">Auto-Generated Features</h5>
                <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                  <li>🔐 Authentication</li>
                  <li>🛡️ Authorization</li>
                  <li>📋 Zod validation</li>
                  <li>📄 Pagination</li>
                  <li>🔍 Search & filters</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 