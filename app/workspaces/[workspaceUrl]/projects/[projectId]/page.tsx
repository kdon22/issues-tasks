// Individual Project Overview Page - 
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';
import { Sidebar } from '@/components/layout/sidebar';
import { PageLayout } from '@/components/layout/page-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarDays, 
  User, 
  Users, 
  Target, 
  FileText, 
  Link as LinkIcon,
  BarChart3,
  Edit3,
  Plus
} from 'lucide-react';

interface ProjectOverviewPageProps {
  params: Promise<{
    workspaceUrl: string;
    projectId: string;
  }>;
}

export default async function ProjectOverviewPage({ params }: ProjectOverviewPageProps) {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { workspaceUrl, projectId } = await params;

  // Check if workspace exists and user has access
  const workspace = await prisma.workspace.findUnique({
    where: { url: workspaceUrl },
    include: {
      members: {
        where: { userId: session.user.id },
        take: 1,
      },
    },
  });

  if (!workspace) {
    redirect('/workspaces/create');
  }

  if (workspace.members.length === 0) {
    redirect('/workspaces/create');
  }

  // Get project details
  const project = await prisma.project.findUnique({
    where: { 
      id: projectId,
      workspaceId: workspace.id,
    },
    include: {
      lead: {
        select: {
          id: true,
          name: true,
          email: true,
          displayName: true,
        },
      },
      team: {
        select: {
          id: true,
          name: true,
          identifier: true,
        },
      },
      issues: {
        select: {
          id: true,
          title: true,
          identifier: true,
          state: {
            select: {
              name: true,
              color: true,
              type: true,
            },
          },
          assignee: {
            select: {
              name: true,
              email: true,
            },
          },
          priority: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
    },
  });

  if (!project) {
    redirect(`/workspaces/${workspaceUrl}/projects`);
  }

  // Calculate project statistics
  const issueStats = {
    total: project.issues.length,
    completed: project.issues.filter(issue => issue.state.type === 'COMPLETED').length,
    inProgress: project.issues.filter(issue => issue.state.type === 'STARTED').length,
    backlog: project.issues.filter(issue => issue.state.type === 'BACKLOG').length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PAUSED': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800';
      case 'CANCELED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'PAUSED': return 'Paused';
      case 'COMPLETED': return 'Completed';
      case 'CANCELED': return 'Canceled';
      default: return 'Unknown';
    }
  };

  return (
    <AppShell sidebar={<Sidebar />}>
      <PageLayout 
        title={project.name}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Project
            </Button>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Issue
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Project Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-2xl">{project.name}</CardTitle>
                  <CardDescription className="text-base">
                    {project.description || 'No description provided'}
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(project.status)}>
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    Project Lead
                  </div>
                  <div className="text-sm font-medium">
                    {project.lead ? (project.lead.displayName || project.lead.name) : 'Unassigned'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    Team
                  </div>
                  <div className="text-sm font-medium">
                    {project.team.name}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CalendarDays className="w-4 h-4" />
                    Start Date
                  </div>
                  <div className="text-sm font-medium">
                    {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="w-4 h-4" />
                    Target Date
                  </div>
                  <div className="text-sm font-medium">
                    {project.targetDate ? new Date(project.targetDate).toLocaleDateString() : 'Not set'}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{issueStats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{issueStats.completed}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{issueStats.inProgress}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Backlog</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">{issueStats.backlog}</div>
              </CardContent>
            </Card>
          </div>

          {/* Project Content Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="issues">Issues</TabsTrigger>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {project.description || 'No detailed description provided. Click Edit Project to add one.'}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <LinkIcon className="w-8 h-8 mx-auto mb-2" />
                    <p>No external resources linked</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Resource
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="issues" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  {project.issues.length > 0 ? (
                    <div className="space-y-3">
                      {project.issues.map((issue) => (
                        <div key={issue.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center gap-3">
                            <Badge 
                              variant="outline" 
                              style={{ 
                                backgroundColor: `${issue.state.color}20`, 
                                borderColor: issue.state.color,
                                color: issue.state.color 
                              }}
                            >
                              {issue.state.name}
                            </Badge>
                            <div>
                              <div className="font-medium">{issue.title}</div>
                              <div className="text-sm text-gray-600">{issue.identifier}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            {issue.assignee ? (issue.assignee.name || issue.assignee.email) : 'Unassigned'}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="w-8 h-8 mx-auto mb-2" />
                      <p>No issues in this project yet</p>
                      <Button variant="outline" size="sm" className="mt-2">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Issue
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="milestones" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Milestones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-8 h-8 mx-auto mb-2" />
                    <p>No milestones defined yet</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Milestone
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Project Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2" />
                    <p>No documents created yet</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Plus className="w-4 h-4 mr-2" />
                      Create Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </AppShell>
  );
} 