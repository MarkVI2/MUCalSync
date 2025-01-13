// src/app/api/auth/[...nextauth]/options.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        // Direct username/password comparison
        if (
          credentials.username === process.env.NEXT_PUBLIC_ADMIN_USERNAME &&
          credentials.password === process.env.ADMIN_PASSWORD
        ) {
          return { id: "1", name: process.env.NEXT_PUBLIC_ADMIN_USERNAME };
        }

        if (
          credentials.username ===
            process.env.NEXT_PUBLIC_TIMETABLE_UPLOAD_USERNAME &&
          credentials.password === process.env.TIMETABLE_UPLOAD_PASSWORD
        ) {
          return {
            id: "2",
            name: process.env.NEXT_PUBLIC_TIMETABLE_UPLOAD_USERNAME,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
};
