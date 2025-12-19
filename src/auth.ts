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
        console.log("authorize called for", credentials?.email);
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          const user = await usersRepo.findByEmail(credentials.email);
          console.log("User found:", !!user);
          if (!user || !user.passwordHash) {
            console.log("User not found or no password hash");
            return null;
          }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );
          console.log("Password valid:", isValid);
          if (!isValid) {
            console.log("Invalid password");
            return null;
          }

          console.log("authorize success");
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            onboarded: user.onboarded,
            username: user.username,
            emailVerified: user.emailVerified,
            referralCode: user.referralCode,
            clientId: user.clientId,
            has_paid: user.has_paid || false,
            subscriptionStatus: user.subscriptionStatus || "trial",
            subscriptionType: user.subscriptionType || null,
          };
        } catch (error) {
          console.error("authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
    maxAge: 60 * 60 * 24, // 24 hours
  },
  callbacks: {
    async signIn({ user, account }: any) {
      console.log("signIn callback called", {
        provider: account?.provider,
        email: user?.email,
      });
      if (account?.provider === "google") {
        try {
          console.log("Processing Google sign-in for", user.email);
          // Check if user exists
          let existingUser = await usersRepo.findByEmail(user.email!);
          console.log("Existing user found:", !!existingUser);

          if (!existingUser) {
            console.log("Creating new user for Google sign-in");
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
            console.log("New user created:", existingUser.id);
          }

          // Update user object with full data for NextAuth
          user.id = existingUser.id.toString();
          user.role = existingUser.role;
          user.onboarded = existingUser.onboarded;
          user.name = existingUser.name;
          user.username = existingUser.username;
          user.emailVerified = existingUser.emailVerified;
          user.referralCode = existingUser.referralCode;
          user.clientId = existingUser.clientId;
          user.has_paid = existingUser.has_paid || false;
          user.subscriptionStatus = existingUser.subscriptionStatus || "trial";
          user.subscriptionType = existingUser.subscriptionType || null;
          console.log("signIn success for Google");

          return true;
        } catch (error) {
          console.error("Google sign-in error:", error);
          return false;
        }
      }
      console.log("signIn success (non-Google)");
      return true;
    },
    async jwt({ token, user }: any) {
      console.log("jwt callback", { hasUser: !!user, tokenId: token?.id });
      if (user) {
        // For new logins, user is passed from authorize or signIn
        token.id = user.id;
        token.role = user.role;
        token.onboarded = user.onboarded;
        token.email = user.email;
        token.name = user.name;
        token.username = user.username;
        token.emailVerified = user.emailVerified;
        token.referralCode = user.referralCode;
        token.clientId = user.clientId;
        token.has_paid = user.has_paid || false;
        token.subscriptionStatus = user.subscriptionStatus || "trial";
        token.subscriptionType = user.subscriptionType || null;
        console.log("jwt updated with user data");
      } else if (token.id) {
        // For subsequent requests, ensure data persists
        // Fetch fresh data if needed, but for now keep existing
        console.log("jwt callback with existing token");
      }
      return token;
    },
    async session({ session, token }: any) {
      console.log("session callback", {
        hasToken: !!token,
        tokenId: token?.id,
      });
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.onboarded = token.onboarded as boolean;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.username = token.username as string;
        session.user.emailVerified = token.emailVerified as boolean;
        session.user.referralCode = token.referralCode as string;
        session.user.clientId = token.clientId as string;
        session.user.has_paid = token.has_paid as boolean;
        session.user.subscriptionStatus = token.subscriptionStatus as string;
        session.user.subscriptionType = token.subscriptionType as string;
        console.log("session updated");
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
