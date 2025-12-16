  import NextAuth, { NextAuthOptions } from "next-auth";
  import GoogleProvider from "next-auth/providers/google";
  import connectDB from "@/lib/mongodb";
  import User from "@/models/User";
  import jwt from "jsonwebtoken";

  // HAPUS import setSessionCookie, kita tidak butuh ini lagi untuk Google Login
  // import { setSessionCookie } from "@/lib/sessionCookie"; 

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
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
      async signIn({ user, account }: any) {
        if (account?.provider === "google") {
          await connectDB();

          try {
            const email = user.email;
            if (!email) return false;

            // Cek apakah user sudah ada
            let dbUser = await User.findOne({ email });

            if (!dbUser) {
              // -- LOGIC BUAT USER BARU --
              const baseName = user.name ? user.name.split(" ")[0] : "user";
              const randomSuffix = Math.floor(1000 + Math.random() * 9000);

              dbUser = new User({
                name: user.name || "No Name",
                email,
                googleId: user.id,
                avatarUrl: user.image,
                isVerified: true,
                role: "user",
                username: `${baseName.toLowerCase()}${randomSuffix}`,
                password: "", // Password kosong karena login via Google
              });
              await dbUser.save();
            } else {
              // -- LOGIC UPDATE USER LAMA --
              let isUpdated = false;
              if (!dbUser.googleId) {
                dbUser.googleId = user.id;
                isUpdated = true;
              }
              // Update avatar jika user lama belum punya atau ingin disinkronkan (opsional)
              if (!dbUser.avatarUrl) {
                dbUser.avatarUrl = user.image;
                isUpdated = true;
              }
              if (!dbUser.isVerified) {
                dbUser.isVerified = true;
                isUpdated = true;
              }
              if (isUpdated) await dbUser.save();
            }

            // ❌ HAPUS BAGIAN setSessionCookie DI SINI
            // Memaksa set cookie di callback signIn sering gagal di Next.js App Router.
            // Kita akan mengandalkan session bawaan NextAuth saja.

            return true;
          } catch (error) {
            console.error("Error creating user from Google:", error);
            return false;
          }
        }

        return true;
      },

      // Callback ini memastikan ID dari MongoDB masuk ke dalam Token NextAuth
      async jwt({ token, user }: any) {
        if (user) {
          await connectDB();
          const dbUser = await User.findOne({ email: user.email });

          if (dbUser) {
            token.id = dbUser._id.toString();
            token.role = dbUser.role || "user";
            token.username = dbUser.username;
          }
        }
        return token;
      },

      // Callback ini meneruskan data dari Token ke Session agar bisa dibaca di backend/frontend
      async session({ session, token }: any) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.username = token.username as string;
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