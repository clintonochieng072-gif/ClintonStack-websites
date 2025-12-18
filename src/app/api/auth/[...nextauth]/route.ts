import NextAuth from "next-auth";
import { authOptions } from "@/auth";

export const runtime = "nodejs";

console.log("NextAuth route loaded, runtime:", runtime);

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
