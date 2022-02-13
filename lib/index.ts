import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const getUsers = async () => {
	return {
		users: await prisma.account.findMany({
			where: {
				isActive: true
			}
		})
	}
}

getUsers()
	.catch((e) => console.error('Error in Prisma Client query: ', e))
	.finally(async () => await prisma.$disconnect())

export default getUsers
