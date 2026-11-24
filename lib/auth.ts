import { getServerSession, type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "用户名", type: "text" },
        password: { label: "密码", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            username: credentials.username
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        if (user.accessStatus !== "ACTIVE") {
          throw new Error("FamilyAccessRequired")
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          theme: user.theme,
          role: user.role,
          sessionVersion: user.sessionVersion,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id
        token.sessionVersion = user.sessionVersion
      }
      return token
    },
    async session({ session, token }) {
      const member = token.sub ? await prisma.user.findUnique({
        where: { id: token.sub },
        select: {
          id: true,
          email: true,
          username: true,
          nickname: true,
          avatar: true,
          theme: true,
          role: true,
          accessStatus: true,
          sessionVersion: true,
        },
      }) : null

      if (member?.accessStatus !== "ACTIVE" || member.sessionVersion !== (token.sessionVersion ?? 0)) {
        throw new Error("FamilySessionExpired")
      }

      session.user = {
        id: member.id,
        email: member.email,
        username: member.username,
        nickname: member.nickname,
        avatar: member.avatar,
        theme: member.theme,
        role: member.role,
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

export function getFamilySession() {
  return getServerSession(authOptions)
}

// 扩展NextAuth类型
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      nickname: string | null
      avatar: string | null
      theme: string
      role: string
    }
  }

  interface User {
    id: string
    email: string
    username: string
    nickname: string | null
    avatar: string | null
    theme: string
    role: string
    sessionVersion: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sessionVersion?: number
  }
}
