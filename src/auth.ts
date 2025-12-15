import NextAuth, { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import { usersRepo } from "@/repositories/usersRepo";
import { generateClientId } from "@/lib/utils";
import bcrypt from "bcryptjs";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
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
      if (user) token.user = user;
      return token;
    },
    async session({ session, token }: any) {
      session.user = token.user as any;
      return session;
    },
  },
};

export const auth = (options?: any) => getServerSession(authOptions, options);

export default NextAuth(authOptions);
