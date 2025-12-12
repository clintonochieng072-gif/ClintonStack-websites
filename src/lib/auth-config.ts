import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { usersRepo } from "@/repositories/usersRepo";
import { generateClientId } from "@/lib/utils";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      try {
        // Read from cookie instead of state
        const signupContextCookie = url.includes("?")
          ? new URL(url).searchParams.get("cookie")
          : null; // Not reliable
        // Actually, cookies are not available in redirect callback
        // Use a different approach

        // For now, default to client flow
        // Later, we can use session to determine role

        return `${baseUrl}/onboarding/niches`;
      } catch (err) {
        console.error("Redirect callback failed:", err);
        return baseUrl;
      }
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          let role = "client";
          let extractedReferralCode = null;

          if (account.state) {
            const context = JSON.parse(account.state as string);
            role = context.role || "client";
            extractedReferralCode = context.referralCode;
            console.log(
              "🎯 SIGNIN: Parsed role from state:",
              role,
              "referral:",
              extractedReferralCode
            );
          } else {
            console.log("❌ SIGNIN: No state found, defaulting to client");
          }

          const existingUser = await usersRepo.findByEmail(user.email!);

          if (!existingUser) {
            console.log("👤 Creating new user:", user.email, "role:", role);

            let referredById = null;
            if (extractedReferralCode) {
              const referrer = await usersRepo.findByReferralCode(
                extractedReferralCode.toUpperCase()
              );

              if (referrer && referrer.role === "affiliate") {
                if (role === "affiliate") {
                  console.error("❌ Affiliates cannot refer other affiliates");
                  return false;
                }
                referredById = referrer.id;
                console.log("✅ Valid referrer found:", referrer.email);
              } else {
                console.log(
                  "⚠️ Invalid or missing referrer for code:",
                  extractedReferralCode
                );
              }
            }

            let baseUsername = user
              .email!.split("@")[0]
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");
            let username = baseUsername;
            let attempts = 0;
            const maxAttempts = 10;

            while (attempts < maxAttempts) {
              const existingUsername = await usersRepo.findByUsername(username);
              if (!existingUsername) break;
              username = `${baseUsername}${Math.floor(Math.random() * 1000)}`;
              attempts++;
            }

            if (attempts >= maxAttempts) {
              console.error(
                "❌ Failed to generate unique username for Google user"
              );
              return false;
            }

            const clientId = generateClientId();

            let referralCode = null;
            if (role === "affiliate") {
              try {
                referralCode = await usersRepo.generateUniqueReferralCode();
                console.log(
                  "✅ Generated referral code for affiliate:",
                  referralCode
                );
              } catch (error) {
                console.error("❌ Failed to generate referral code:", error);
                return false;
              }
            }

            const tempPassword = "google";
            const passwordHash = await bcrypt.hash(tempPassword, 12);

            const newUser = await usersRepo.create({
              name: user.name || user.email!.split("@")[0],
              username,
              email: user.email!,
              passwordHash,
              role: role as any,
              referralCode,
              clientId,
              referredById,
              emailVerified: true,
              onboarded: role === "affiliate",
            });

            console.log("✅ User created successfully:", newUser.id);

            // Create the Google account link for the new user
            if (account) {
              await prisma.account.create({
                data: {
                  userId: newUser.id,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  type: account.type,
                  access_token: account.access_token,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                },
              });
              console.log("✅ Linked Google account to new user");
            }

            user.id = newUser.id;
            (user as any).role = newUser.role;
            (user as any).onboarded = newUser.onboarded;
            (user as any).referralCode = newUser.referralCode || undefined;
            (user as any).tempPassword = tempPassword;
          } else {
            console.log("👤 Existing user found:", existingUser.email);

            // Link the Google account to the existing user if not already linked
            if (account) {
              const existingAccount = await prisma.account.findUnique({
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                  },
                },
              });

              if (!existingAccount) {
                await prisma.account.create({
                  data: {
                    userId: existingUser.id,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    type: account.type,
                    access_token: account.access_token,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                  },
                });
                console.log("✅ Linked Google account to existing user");
              } else {
                console.log("ℹ️ Google account already linked to this user");
              }
            }

            user.id = existingUser.id;
            (user as any).role = existingUser.role;
            (user as any).onboarded = existingUser.onboarded;
            (user as any).referralCode = existingUser.referralCode || undefined;
            (user as any).tempPassword = "google";
          }

          return true;
        } catch (error) {
          console.error("❌ Google OAuth sign-in error:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.onboarded = (user as any).onboarded;
        token.referralCode = (user as any).referralCode;
        token.tempPassword = (user as any).tempPassword;
        // Fetch fresh has_paid
        const freshUser = await usersRepo.findById(user.id);
        token.has_paid = freshUser?.has_paid || false;
        token.subscriptionStatus = freshUser?.subscriptionStatus;
      }

      // On update or when no user
      if (trigger === "update" || (!user && token.id)) {
        const freshUser = await usersRepo.findById(token.id as string);
        token.has_paid = freshUser?.has_paid || false;
        token.subscriptionStatus = freshUser?.subscriptionStatus;
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.onboarded = token.onboarded as boolean;
      session.user.referralCode = token.referralCode as string;
      session.user.tempPassword = token.tempPassword as string;
      (session.user as any).has_paid = token.has_paid as boolean;
      (session.user as any).subscriptionStatus =
        token.subscriptionStatus as string;
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});
