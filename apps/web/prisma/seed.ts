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