// Seed data for 
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@linear.dev' },
    update: {},
    create: {
      email: 'demo@linear.dev',
      name: 'Demo User',
      displayName: 'Demo',
      password: hashedPassword,
      avatarType: 'INITIALS',
      avatarColor: '#FF6B35',
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create demo workspace
  const workspace = await prisma.workspace.upsert({
    where: { url: 'demo-workspace' },
    update: {},
    create: {
      name: 'Demo Workspace',
      url: 'demo-workspace',
      avatarType: 'INITIALS',
      avatarColor: '#FF6B35',
    },
  });

  console.log('✅ Created demo workspace:', workspace.name);

  // Add user to workspace
  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: user.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      workspaceId: workspace.id,
      role: 'ADMIN',
    },
  });

  console.log('✅ Added user to workspace');

  // Create second test user (regular member)
  const regularUser = await prisma.user.upsert({
    where: { email: 'member@linear.dev' },
    update: {},
    create: {
      email: 'member@linear.dev',
      name: 'Regular Member',
      displayName: 'Member',
      password: hashedPassword,
      avatarType: 'INITIALS',
      avatarColor: '#10B981',
    },
  });

  // Add regular user to workspace as MEMBER
  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        userId: regularUser.id,
        workspaceId: workspace.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      workspaceId: workspace.id,
      role: 'MEMBER', // Regular member, not admin
    },
  });

  console.log('✅ Created regular user and added to workspace');

  // Create default instance for multi-tenant SaaS architecture 🏗️
  const instance = await prisma.instance.upsert({
    where: { slug: 'issuestasks' },
    update: {},
    create: {
      name: 'Issues Tasks Demo',
      slug: 'issuestasks',
      domain: 'localhost:3000',
      status: 'ACTIVE',
      config: {},
    },
  });

  console.log('✅ Created default instance:', instance.name);

  // Create user instance sessions for both users
  await prisma.userInstanceSession.upsert({
    where: {
      userId_instanceId: {
        userId: user.id,
        instanceId: instance.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      instanceId: instance.id,
      isActive: true,
      sessionData: {},
    },
  });

  await prisma.userInstanceSession.upsert({
    where: {
      userId_instanceId: {
        userId: regularUser.id,
        instanceId: instance.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      instanceId: instance.id,
      isActive: true,
      sessionData: {},
    },
  });

  console.log('✅ Created user instance sessions');

  // Create user instance permissions
  await prisma.userInstancePermission.upsert({
    where: {
      userId_instanceId: {
        userId: user.id,
        instanceId: instance.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      instanceId: instance.id,
      role: 'ADMIN',
      permissions: {
        admin: true,
        manageUsers: true,
        manageSettings: true,
      },
    },
  });

  await prisma.userInstancePermission.upsert({
    where: {
      userId_instanceId: {
        userId: regularUser.id,
        instanceId: instance.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      instanceId: instance.id,
      role: 'MEMBER',
      permissions: {
        admin: false,
        manageUsers: false,
        manageSettings: false,
      },
    },
  });

  console.log('✅ Created user instance permissions');

  // Create demo teams
  const webTeam = await prisma.team.upsert({
    where: { 
      workspaceId_identifier: {
        workspaceId: workspace.id,
        identifier: 'WEB'
      }
    },
    update: {},
    create: {
      name: 'Web Team',
      identifier: 'WEB',
      description: 'Frontend and web development team',
      workspaceId: workspace.id,
      icon: 'globe:blue',
      isPrivate: false,
      settings: {},
    },
  });

  const privateTeam = await prisma.team.upsert({
    where: { 
      workspaceId_identifier: {
        workspaceId: workspace.id,
        identifier: 'EXEC'
      }
    },
    update: {},
    create: {
      name: 'Executive Team',
      identifier: 'EXEC',
      description: 'Executive and leadership team',
      workspaceId: workspace.id,
      icon: 'shield:red',
      isPrivate: true,
      settings: {},
    },
  });

  const publicTeam = await prisma.team.upsert({
    where: { 
      workspaceId_identifier: {
        workspaceId: workspace.id,
        identifier: 'SUPPORT'
      }
    },
    update: {},
    create: {
      name: 'Support Team',
      identifier: 'SUPPORT',
      description: 'Customer support and help desk',
      workspaceId: workspace.id,
      icon: 'headphones:green',
      isPrivate: false,
      settings: {},
    },
  });

  console.log('✅ Created demo teams:', webTeam.name, privateTeam.name, publicTeam.name);

  // Add user to teams
  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: user.id,
        teamId: webTeam.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      teamId: webTeam.id,
      role: 'ADMIN',
    },
  });

  // Add user to support team (public)
  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: user.id,
        teamId: publicTeam.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      teamId: publicTeam.id,
      role: 'MEMBER',
    },
  });

  // Add regular user to only public team (not private)
  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: regularUser.id,
        teamId: publicTeam.id,
      },
    },
    update: {},
    create: {
      userId: regularUser.id,
      teamId: publicTeam.id,
      role: 'MEMBER',
    },
  });

  // Don't add admin user to private team - this tests the filtering
  // Don't add regular user to private team - this tests the filtering
  console.log('✅ Added users to teams');

  // Create default status flows
  const defaultStatusFlow = await prisma.statusFlow.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Default Workflow',
      },
    },
    update: {},
    create: {
      name: 'Default Workflow',
      description: 'Standard workflow for most tasks',
      color: '#6B7280',
      icon: 'workflow',
      isDefault: true,
      workspaceId: workspace.id,
    },
  });

  const bugStatusFlow = await prisma.statusFlow.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Bug Workflow',
      },
    },
    update: {},
    create: {
      name: 'Bug Workflow',
      description: 'Workflow for tracking and fixing bugs',
      color: '#EF4444',
      icon: 'bug',
      isDefault: false,
      workspaceId: workspace.id,
    },
  });

  console.log('✅ Created status flows');

  // Create states for default status flow
  const defaultStates = [
    { name: 'Backlog', type: 'BACKLOG' as const, color: '#94A3B8', position: 0 },
    { name: 'Todo', type: 'UNSTARTED' as const, color: '#64748B', position: 1 },
    { name: 'In Progress', type: 'STARTED' as const, color: '#3B82F6', position: 2 },
    { name: 'In Review', type: 'STARTED' as const, color: '#8B5CF6', position: 3 },
    { name: 'Done', type: 'COMPLETED' as const, color: '#10B981', position: 4 },
    { name: 'Canceled', type: 'CANCELED' as const, color: '#EF4444', position: 5 },
  ];

  for (const stateData of defaultStates) {
    const existingState = await prisma.state.findFirst({
      where: {
        statusFlowId: defaultStatusFlow.id,
        name: stateData.name,
      },
    });
    
    if (!existingState) {
      await prisma.state.create({
        data: {
          ...stateData,
          statusFlowId: defaultStatusFlow.id,
          workspaceId: workspace.id,
        },
      });
    }
  }

  // Create states for bug workflow
  const bugStates = [
    { name: 'Triage', type: 'BACKLOG' as const, color: '#F59E0B', position: 0 },
    { name: 'Investigating', type: 'STARTED' as const, color: '#3B82F6', position: 1 },
    { name: 'Fixing', type: 'STARTED' as const, color: '#8B5CF6', position: 2 },
    { name: 'Testing', type: 'STARTED' as const, color: '#06B6D4', position: 3 },
    { name: 'Fixed', type: 'COMPLETED' as const, color: '#10B981', position: 4 },
    { name: 'Won\'t Fix', type: 'CANCELED' as const, color: '#EF4444', position: 5 },
  ];

  for (const stateData of bugStates) {
    const existingState = await prisma.state.findFirst({
      where: {
        statusFlowId: bugStatusFlow.id,
        name: stateData.name,
      },
    });
    
    if (!existingState) {
      await prisma.state.create({
        data: {
          ...stateData,
          statusFlowId: bugStatusFlow.id,
          workspaceId: workspace.id,
        },
      });
    }
  }

  console.log('✅ Created states');

  // Create default field set
  const defaultFieldSet = await prisma.fieldSet.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Standard',
      },
    },
    update: {},
    create: {
      name: 'Standard',
      description: 'Standard fields for most issues',
      workspaceId: workspace.id,
      isDefault: true,
    },
  });

  // Create field set configurations for the default field set
  const fieldConfigurations = [
    { fieldKey: 'title', isRequired: true, isVisible: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 0 },
    { fieldKey: 'description', isRequired: false, isVisible: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 1 },
    { fieldKey: 'state', isRequired: true, isVisible: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 2 },
    { fieldKey: 'priority', isRequired: false, isVisible: true, showOnSubtask: false, showOnNewIssue: true, displayOrder: 3 },
    { fieldKey: 'assignee', isRequired: false, isVisible: true, showOnSubtask: true, showOnNewIssue: true, displayOrder: 4 },
    { fieldKey: 'team', isRequired: true, isVisible: true, showOnSubtask: false, showOnNewIssue: true, displayOrder: 5 },
    { fieldKey: 'labels', isRequired: false, isVisible: true, showOnSubtask: false, showOnNewIssue: true, displayOrder: 6 },
    { fieldKey: 'dueDate', isRequired: false, isVisible: true, showOnSubtask: true, showOnNewIssue: false, displayOrder: 7 }
  ];

  for (const config of fieldConfigurations) {
    await prisma.fieldSetConfiguration.upsert({
      where: {
        fieldSetId_fieldKey_context: {
          fieldSetId: defaultFieldSet.id,
          fieldKey: config.fieldKey,
          context: 'create',
        },
      },
      update: {},
      create: {
        fieldSetId: defaultFieldSet.id,
        fieldKey: config.fieldKey,
        isRequired: config.isRequired,
        isVisible: config.isVisible,
        showOnSubtask: config.showOnSubtask,
        showOnNewIssue: config.showOnNewIssue,
        displayOrder: config.displayOrder,
        context: 'create',
      },
    });
  }

  console.log('✅ Created default field set');

  // Create issue types that reference the status flows
  const taskIssueType = await prisma.issueType.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Task',
      },
    },
    update: {},
    create: {
      name: 'Task',
      description: 'General task or work item',
      icon: 'Check',
      workspaceId: workspace.id,
      statusFlowId: defaultStatusFlow.id,
      isDefault: true,
    },
  });

  const bugIssueType = await prisma.issueType.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Bug',
      },
    },
    update: {},
    create: {
      name: 'Bug',
      description: 'Something that is broken and needs fixing',
      icon: 'AlertCircle',
      workspaceId: workspace.id,
      statusFlowId: bugStatusFlow.id,
      isDefault: false,
    },
  });

  console.log('✅ Created issue types');

  // Create demo project
  const project = await prisma.project.upsert({
    where: {
      teamId_identifier: {
        teamId: webTeam.id,
        identifier: 'WEBAPP'
      }
    },
    update: {},
    create: {
      name: 'Web Application',
      identifier: 'WEBAPP',
      description: 'Main web application project',
      color: '#FF6B35',
      status: 'ACTIVE',
      leadUserId: user.id,
      teamId: webTeam.id,
      workspaceId: workspace.id,
    },
  });

  console.log('✅ Created demo project:', project.name);

  // Get states for demo issues
  const allStates = await prisma.state.findMany({
    where: {
      statusFlow: {
        workspaceId: workspace.id,
      },
    },
    include: {
      statusFlow: true,
    },
  });

  const backlogState = allStates.find(s => s.name === 'Backlog');
  const todoState = allStates.find(s => s.name === 'Todo');
  const inProgressState = allStates.find(s => s.name === 'In Progress');
  const inReviewState = allStates.find(s => s.name === 'In Review');
  const doneState = allStates.find(s => s.name === 'Done');
  const triageState = allStates.find(s => s.name === 'Triage');
  const fixingState = allStates.find(s => s.name === 'Fixing');

  // Create demo labels
  const frontendLabel = await prisma.label.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Frontend',
      },
    },
    update: {},
    create: {
      name: 'Frontend',
      description: 'Frontend development tasks',
      color: '#3B82F6',
      workspaceId: workspace.id,
    },
  });

  const backendLabel = await prisma.label.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Backend',
      },
    },
    update: {},
    create: {
      name: 'Backend',
      description: 'Backend development tasks',
      color: '#10B981',
      workspaceId: workspace.id,
    },
  });

  const urgentLabel = await prisma.label.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Urgent',
      },
    },
    update: {},
    create: {
      name: 'Urgent',
      description: 'Urgent issues that need immediate attention',
      color: '#EF4444',
      workspaceId: workspace.id,
    },
  });

  const enhancementLabel = await prisma.label.upsert({
    where: {
      workspaceId_name: {
        workspaceId: workspace.id,
        name: 'Enhancement',
      },
    },
    update: {},
    create: {
      name: 'Enhancement',
      description: 'New features and improvements',
      color: '#8B5CF6',
      workspaceId: workspace.id,
    },
  });

  console.log('✅ Created demo labels');

  // Create demo issues
  const mockIssues = [
    {
      title: 'Set up authentication system',
      description: 'Implement user authentication with NextAuth.js and secure login flows',
      priority: 'HIGH' as const,
      issueTypeId: taskIssueType.id,
      stateId: inProgressState?.id || backlogState?.id,
      teamId: webTeam.id,
      projectId: project.id,
      creatorId: user.id,
      assigneeId: user.id,
      labels: [backendLabel.id, urgentLabel.id],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    {
      title: 'Build user dashboard',
      description: 'Create the main dashboard interface with widgets and user customization',
      priority: 'MEDIUM' as const,
      issueTypeId: taskIssueType.id,
      stateId: todoState?.id || backlogState?.id,
      teamId: webTeam.id,
      projectId: project.id,
      creatorId: user.id,
      assigneeId: regularUser.id,
      labels: [frontendLabel.id, enhancementLabel.id],
    },
    {
      title: 'Add dark mode support',
      description: 'Implement theme switching functionality with persistent user preferences',
      priority: 'LOW' as const,
      issueTypeId: taskIssueType.id,
      stateId: backlogState?.id,
      teamId: webTeam.id,
      projectId: project.id,
      creatorId: regularUser.id,
      labels: [frontendLabel.id],
    },
    {
      title: 'Fix login redirect issue',
      description: 'Users are not being redirected properly after successful login',
      priority: 'URGENT' as const,
      issueTypeId: bugIssueType.id,
      stateId: fixingState?.id || inProgressState?.id,
      teamId: webTeam.id,
      projectId: project.id,
      creatorId: regularUser.id,
      assigneeId: user.id,
      labels: [backendLabel.id, urgentLabel.id],
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    },
    {
      title: 'Optimize database queries',
      description: 'Improve performance of slow database queries in the user dashboard',
      priority: 'MEDIUM' as const,
      issueTypeId: taskIssueType.id,
      stateId: inReviewState?.id || todoState?.id,
      teamId: webTeam.id,
      projectId: project.id,
      creatorId: user.id,
      assigneeId: user.id,
      labels: [backendLabel.id],
    },
    {
      title: 'Add email notifications',
      description: 'Implement email notification system for important events',
      priority: 'MEDIUM' as const,
      issueTypeId: taskIssueType.id,
      stateId: todoState?.id || backlogState?.id,
      teamId: webTeam.id,
      projectId: project.id,
      creatorId: user.id,
      labels: [backendLabel.id, enhancementLabel.id],
    },
    {
      title: 'Mobile responsive design',
      description: 'Ensure the application works well on mobile devices',
      priority: 'HIGH' as const,
      issueTypeId: taskIssueType.id,
      stateId: inProgressState?.id || todoState?.id,
      teamId: webTeam.id,
      projectId: project.id,
      creatorId: regularUser.id,
      assigneeId: regularUser.id,
      labels: [frontendLabel.id],
    },
    {
      title: 'Update documentation',
      description: 'Update API documentation and user guides',
      priority: 'LOW' as const,
      issueTypeId: taskIssueType.id,
      stateId: backlogState?.id,
      teamId: webTeam.id,
      creatorId: user.id,
      labels: [],
    },
    {
      title: 'Memory leak in dashboard',
      description: 'Dashboard component has a memory leak that affects performance',
      priority: 'HIGH' as const,
      issueTypeId: bugIssueType.id,
      stateId: triageState?.id || backlogState?.id,
      teamId: webTeam.id,
      projectId: project.id,
      creatorId: regularUser.id,
      labels: [frontendLabel.id, urgentLabel.id],
    },
    {
      title: 'Add search functionality',
      description: 'Implement global search across all content types',
      priority: 'MEDIUM' as const,
      issueTypeId: taskIssueType.id,
      stateId: doneState?.id || backlogState?.id,
      teamId: webTeam.id,
      projectId: project.id,
      creatorId: user.id,
      assigneeId: user.id,
      labels: [frontendLabel.id, backendLabel.id, enhancementLabel.id],
    },
  ];

  // Create the issues with proper identifier and number generation
  for (let i = 0; i < mockIssues.length; i++) {
    const issueData = mockIssues[i];
    if (!issueData.stateId) continue;

    // Get the team to create the identifier
    const team = await prisma.team.findUnique({
      where: { id: issueData.teamId },
      select: { identifier: true },
    });

    if (!team) {
      console.error(`Team not found for issue: ${issueData.title}`);
      continue;
    }

    // Get the next number for this team
    const lastIssue = await prisma.issue.findFirst({
      where: { teamId: issueData.teamId },
      orderBy: { number: 'desc' },
      select: { number: true },
    });

    const nextNumber = (lastIssue?.number || 0) + 1;
    const identifier = `${team.identifier}-${nextNumber}`;

    const issue = await prisma.issue.create({
      data: {
        title: issueData.title,
        description: issueData.description,
        priority: issueData.priority,
        identifier: identifier,
        number: nextNumber,
        issueTypeId: issueData.issueTypeId,
        stateId: issueData.stateId,
        teamId: issueData.teamId,
        projectId: issueData.projectId,
        creatorId: issueData.creatorId,
        assigneeId: issueData.assigneeId,
        dueDate: issueData.dueDate,
        workspaceId: workspace.id,
      },
    });

    // Add labels to the issue
    for (const labelId of issueData.labels) {
      await prisma.issueLabel.create({
        data: {
          issueId: issue.id,
          labelId: labelId,
        },
      });
    }

    console.log(`✅ Created issue: ${issue.identifier} - ${issue.title}`);
  }

  console.log('✅ Created demo issues with labels');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 