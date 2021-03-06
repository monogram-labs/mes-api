'use strict'

import Hapi from '@hapi/hapi'
import prisma from '../plugins/prisma'
import users from '../plugins/users'

const server: Hapi.Server = Hapi.server({
	port: process.env.PORT || 4000,
	host: process.env.HOST || 'localhost'
})

export async function start(): Promise<Hapi.Server> {
	await server.register([prisma, users])
	await server.start()
	return server
}

server.route({
	method: 'GET',
	path: '/',
	handler: (request, h) => {
		return '🌟 .menv APIs 🌟'
	}
})

process.on('unhandledRejection', async (err) => {
	await server.app.prisma.$disconnect()
	console.log(err)
	process.exit(1)
})

start()
	.then((server) => {
		console.log(`🚀 Server ready at: ${server.info.uri}`)
	})
	.catch((err) => {
		console.log(err)
	})
