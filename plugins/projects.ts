import Hapi from '@hapi/hapi'
// import { Prisma } from '@prisma/client'
/*
 * TODO: We can't use this type because it is available only in 2.11.0 and previous versions
 * In 2.12.0, this will be namespaced under Prisma and can be used as Prisma.UserCreateInput
 * Once 2.12.0 is release, we can adjust this example.
 */
// import { UserCreateInput } from '@prisma/client'

// plugin to instantiate Prisma Client
const projectsPlugin = {
	name: 'app/projects',
	dependencies: ['prisma'],
	register: async function (server: Hapi.Server) {
		server.route([
			{
				method: 'GET',
				path: '/project',
				handler: getProjectDetailsHandler
			}
		]),
			server.route([
				{
					method: 'POST',
					path: '/new-project',
					handler: newProjectHandler
				}
			])
	}
}

export default projectsPlugin

async function newProjectHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
	const { prisma } = request.server.app
	const { name, gitUrl } = request.payload as any

	try {
		const createdProject = await prisma.project.create({
			data: {
				name,
				gitUrl
			}
		})
		return h.response(createdProject).code(201)
	} catch (err) {
		console.log(err)
	}
}

async function getProjectDetailsHandler(request: Hapi.Request, h: Hapi.ResponseToolkit) {
	const { prisma } = request.server.app
	const query = request.query as any

	const projectId = query?.projectId
	const apiKey = request.headers['x-api-key']

	// return 400 if apiKey or projectId is missing
	if (!apiKey || !projectId)
		return h.response({ message: 'Missing API key or projectId.' }).code(400)

	try {
		const project = await prisma.project.findMany({
			where: {
				AND: {
					id: projectId
					// apiKeys: {
					// 	some: {
					// 		key: apiKey
					// 	}
					// }
				}
			}
			// include: {
			// 	apiKeys: true
			// }
		})

		// Get the variables for the project
		const variables = await prisma.project.findMany({
			where: {
				id: project[0].id
			},
			take: 1,
			orderBy: {
				createdAt: 'desc'
			}
		})

		const retval =
			Array.isArray(project) && project.length > 0
				? {
						project: project[0],
						variables: variables[0]
				  }
				: null

		return retval ? h.response(retval).code(200) : null
	} catch (err) {
		console.log(err)
	}
}
