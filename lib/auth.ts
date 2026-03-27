import { NextAuthOptions } from "next-auth"
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

        return {
          id: user.id,
          email: user.email,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          theme: user.theme,
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
        token.id = user.id
        token.username = user.username
        token.nickname = user.nickname
        token.avatar = user.avatar
        token.theme = user.theme
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.username = token.username as string
        session.user.nickname = token.nickname as string | null
        session.user.avatar = token.avatar as string | null
        session.user.theme = token.theme as string
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
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
    }
  }

  interface User {
    id: string
    email: string
    username: string
    nickname: string | null
    avatar: string | null
    theme: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    username: string
    nickname: string | null
    avatar: string | null
    theme: string
  }
}
