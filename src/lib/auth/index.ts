import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

// Demo user for testing (no database required)
const DEMO_USER = {
  id: "demo-user-123",
  email: "person@ccs.app",
  name: "Demo User",
  password: "CcsXr7!mPq2024",
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string
        const password = credentials?.password as string

        console.log("Login attempt:", { email, passwordLength: password?.length })

        if (!email || !password) {
          console.log("Missing email or password")
          return null
        }

        // Demo user login (works without database)
        if (email.toLowerCase() === DEMO_USER.email.toLowerCase() && password === DEMO_USER.password) {
          console.log("Demo user matched!")
          return {
            id: DEMO_USER.id,
            email: DEMO_USER.email,
            name: DEMO_USER.name,
          }
        }

        console.log("Credentials did not match demo user")
        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
