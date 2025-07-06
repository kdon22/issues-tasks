// import { PrismaClient } from '@prisma/client'
// import { hash } from 'bcryptjs'

// const prisma = new PrismaClient()

// async function main() {
//   try {
//     // Create user first
//     const hashedPassword = await hash('00000', 12)
//     const user = await prisma.user.create({
//       data: {
//         email: "kdon22@me.com",
//         name: "Test User",
//         password: hashedPassword,
//         workspaces: {
//           create: {
//             workspace: {
//               create: {
//                 name: "Test Workspace",
//                 url: "test1",
//                 fiscalYearStart: "January",
//                 region: "United States"
//               }
//             },
//             role: "OWNER"
//           }
//         },
//         preferences: {
//           create: {
//             workspaceId: "",
//             defaultHomeView: "active-issues",
//             fontSize: "default",
//             usePointerCursor: false,
//             displayFullNames: false,
//             interfaceTheme: "system",
//             firstDayOfWeek: "Monday",
//             useEmoticons: true
//           }
//         }
//       },
//       include: {
//         workspaces: {
//           include: {
//             workspace: true
//           }
//         }
//       }
//     })

//     // Update preferences with workspace ID
//     if (user.workspaces[0]) {
//       await prisma.userPreferences.update({
//         where: {
//           userId_workspaceId: {
//             userId: user.id,
//             workspaceId: user.workspaces[0].workspaceId
//           }
//         },
//         data: {
//           workspaceId: user.workspaces[0].workspaceId
//         }
//       })
//     }

//     console.log('Seeding completed successfully')
//   } catch (error) {
//     console.error('Error seeding data:', error)
//     throw error
//   }
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })

// Seed data for Linear Clone
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

  // Create demo team
  const team = await prisma.team.upsert({
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
      avatarType: 'INITIALS',
      avatarColor: '#6366F1',
    },
  });

  console.log('✅ Created demo team:', team.name);

  // Add user to team
  await prisma.teamMember.upsert({
    where: {
      userId_teamId: {
        userId: user.id,
        teamId: team.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      teamId: team.id,
      role: 'ADMIN',
    },
  });

  console.log('✅ Added user to team');

  // Create states
  const states = [
    { name: 'Backlog', type: 'BACKLOG', color: '#94A3B8', position: 0 },
    { name: 'Todo', type: 'UNSTARTED', color: '#64748B', position: 1 },
    { name: 'In Progress', type: 'STARTED', color: '#3B82F6', position: 2 },
    { name: 'In Review', type: 'STARTED', color: '#8B5CF6', position: 3 },
    { name: 'Done', type: 'COMPLETED', color: '#10B981', position: 4 },
    { name: 'Canceled', type: 'CANCELED', color: '#EF4444', position: 5 },
  ];

  for (const stateData of states) {
    await prisma.state.upsert({
      where: {
        teamId_name: {
          teamId: team.id,
          name: stateData.name,
        },
      },
      update: {},
      create: {
        ...stateData,
        teamId: team.id,
        workspaceId: workspace.id,
      },
    });
  }

  console.log('✅ Created states');

  // Create demo project
  const project = await prisma.project.upsert({
    where: {
      teamId_identifier: {
        teamId: team.id,
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
      teamId: team.id,
      workspaceId: workspace.id,
    },
  });

  console.log('✅ Created demo project:', project.name);

  // Get the first state for demo issues
  const backlogState = await prisma.state.findFirst({
    where: { teamId: team.id, name: 'Backlog' },
  });

  if (backlogState) {
    // Create demo issues
    const issues = [
      {
        title: 'Set up authentication system',
        description: 'Implement user authentication with NextAuth.js',
        priority: 'HIGH',
      },
      {
        title: 'Build user dashboard',
        description: 'Create the main dashboard interface',
        priority: 'MEDIUM',
      },
      {
        title: 'Add dark mode support',
        description: 'Implement theme switching functionality',
        priority: 'LOW',
      },
    ];

    for (let i = 0; i < issues.length; i++) {
      const issueData = issues[i];
      const issueNumber = i + 1;
      
      await prisma.issue.upsert({
        where: {
          teamId_number: {
            teamId: team.id,
            number: issueNumber,
          },
        },
        update: {},
        create: {
          ...issueData,
          identifier: `${team.identifier}-${issueNumber}`,
          number: issueNumber,
          creatorId: user.id,
          teamId: team.id,
          workspaceId: workspace.id,
          stateId: backlogState.id,
          projectId: project.id,
        },
      });
    }

    console.log('✅ Created demo issues');
  }

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