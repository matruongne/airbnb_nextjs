import NextAuth, { AuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import prisma from '../../../libs/prismadb'
import GoogleProvider from 'next-auth/providers/google'
import GithubProvider from 'next-auth/providers/github'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'

export const authOptions: AuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
		}),
		GithubProvider({
			clientId: process.env.GITHUB_CLIENT_ID!,
			clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		}),
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: {
					label: 'email',
					type: 'text',
				},
				password: {
					label: 'password',
					type: 'password',
				},
			},
			async authorize(credentials, req) {
				if (!credentials?.email || !credentials?.password) throw new Error('Invalid credentials')

				const user = await prisma.user.findUnique({
					where: {
						email: credentials?.email,
					},
				})

				if (!user || !user?.hashedPassword) throw new Error('Invalid credentials')

				const isCorrectPassword = await bcrypt.compare(credentials.password, user.hashedPassword)

				if (!isCorrectPassword) throw new Error('Invalid credentials')

				return user
			},
		}),
	],
	debug: process.env.NODE_ENV === 'development',
	session: {
		strategy: 'jwt',
	},
	secret: process.env.NEXTAUTH_SECRET,
	adapter: PrismaAdapter(prisma),
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST, handler as PUT, handler as DELETE }
