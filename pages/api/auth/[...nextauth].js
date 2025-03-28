import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // Thêm userId vào session để sử dụng sau này
      session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
});
