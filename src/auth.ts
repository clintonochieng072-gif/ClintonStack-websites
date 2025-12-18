import NextAuth, { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import type { NextRequest } from "next/server";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { usersRepo } from "@/repositories/usersRepo";
import { generateClientId } from "@/lib/utils";
import bcrypt from "bcryptjs";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await usersRepo.findByEmail(credentials.email);
        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          onboarded: user.onboarded,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 24, // 24 hours
  },
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        try {
          // Check if user exists
          let existingUser = await usersRepo.findByEmail(user.email!);

          if (!existingUser) {
            // Create new user for Google sign-in
            const hashedGoogle = await bcrypt.hash("google", 12);
            const clientId = generateClientId();
            existingUser = await usersRepo.create({
              name: user.name!,
              email: user.email!,
              username: user.email!.split("@")[0], // Use email prefix as username
              passwordHash: hashedGoogle,
              role: "client",
              clientId,
              onboarded: false,
              emailVerified: true, // Google accounts are pre-verified
            });
          }

          // Update user ID for NextAuth
          user.id = existingUser.id.toString();
          user.role = existingUser.role;
          user.onboarded = existingUser.onboarded;

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.onboarded = user.onboarded;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.onboarded = token.onboarded as boolean;
        session.user.email = token.email as string;
      }
      return session;
    },
  },
};

export const auth = () => getServerSession(authOptions);

export default NextAuth(authOptions);
