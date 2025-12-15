export const authOptions = {
  providers: [],
  callbacks: {
    async signIn({ user, account, profile }: any) {
      console.log("Sign in callback called", { user, account });
      return true;
    },
    async jwt({ token, user }: any) {
      console.log("JWT callback called", { token, user });
      return token;
    },
    async session({ session, token }: any) {
      console.log("Session callback called", { session, token });
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt" as const,
  },
};
