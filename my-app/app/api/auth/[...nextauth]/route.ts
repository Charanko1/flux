import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { signToken } from "@/lib/jwt"; // Pastikan file ini ada!

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET, // Tambahan: Pastikan secret terpasang
  callbacks: {
    // 1. Saat user Login via Google
    async signIn({ user, account }: any) {
      if (account?.provider === "google") {
        await connectDB();
        
        try {
          const email = user.email;
          if (!email) return false; // Safety check

          const existingUser = await User.findOne({ email });

          if (!existingUser) {
            // BUAT USER BARU
            // Generate username random dari nama atau email
            const baseName = user.name ? user.name.split(" ")[0] : "user";
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            
            const newUser = new User({
              name: user.name || "No Name",
              email: email,
              googleId: user.id,
              avatarUrl: user.image,
              isVerified: true,
              role: "user",
              username: `${baseName.toLowerCase()}${randomSuffix}`,
            });
            await newUser.save();
          } else {
            // UPDATE USER LAMA (Link Account)
            if (!existingUser.googleId) {
              existingUser.googleId = user.id;
              if (!existingUser.avatarUrl) existingUser.avatarUrl = user.image;
              existingUser.isVerified = true;
              await existingUser.save();
            }
          }
          return true;
        } catch (error) {
          console.error("Error creating user from Google:", error);
          return false;
        }
      }
      return true;
    },

    // 2. Memproses JWT (Pakai ': any' biar TS gak ngamuk soal custom field)
    async jwt({ token, user, account }: any) {
      // Jalan saat pertama kali login
      if (account && user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });
        
        if (dbUser) {
          // Bikin token manual kita
          const customToken = signToken(dbUser._id.toString());
          
          // Masukkan data ke token NextAuth
          token.accessToken = customToken;
          token.id = dbUser._id.toString();
          token.role = dbUser.role;
          token.username = dbUser.username;
        }
      }
      return token;
    },

    // 3. Mengirim Session ke Frontend (Pakai ': any' lagi)
    async session({ session, token }: any) {
      if (session.user) {
        session.accessToken = token.accessToken; // Token custom kita
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };