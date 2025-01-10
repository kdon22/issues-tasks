import { prisma } from '../src/lib/prisma'

async function main() {
  try {
    const users = await prisma.user.findMany()
    console.log('Connected to database successfully')
    console.log('Users:', users)
  } catch (error) {
    console.error('Database connection error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 