import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { setSessionCookie } from "@/lib/sessionCookie";

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

          let dbUser = await User.findOne({ email });

          if (!dbUser) {
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
              password: "",
            });
            await dbUser.save();
          } else {
            let isUpdated = false;
            if (!dbUser.googleId) {
              dbUser.googleId = user.id;
              isUpdated = true;
            }
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

          // set cookie "session" dengan JWT yang dipakai backend
          await setSessionCookie({
            _id: dbUser._id.toString(),
            email: dbUser.email,
            name: dbUser.name,
          });

          return true;
        } catch (error) {
          console.error("Error creating user from Google:", error);
          return false;
        }
      }

      return true;
    },

    async jwt({ token, user }: any) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          const backendToken = jwt.sign(
            {
              id: dbUser._id.toString(),
              email: dbUser.email,
              name: dbUser.name,
            },
            process.env.JWT_SECRET!,
            { expiresIn: "7d" }
          );

          token.accessToken = backendToken;
          token.id = dbUser._id.toString();
          token.role = dbUser.role || "user";
          token.username = dbUser.username;
        }
      }
      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.accessToken = token.accessToken;
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
