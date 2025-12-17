import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook"; // Jangan lupa import ini
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    // Tambahkan Facebook Provider agar tombol Facebook kamu jalan
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account }: any) {
      if (account?.provider === "google" || account?.provider === "facebook") {
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
              googleId: account.provider === "google" ? user.id : undefined,
              // Tambahkan field facebookId jika perlu di masa depan, atau biarkan kosong
              avatarUrl: user.image,
              isVerified: true,
              role: "user",
              username: `${baseName.toLowerCase()}${randomSuffix}`,
              password: "", // Password kosong karena login via Social
            });
            await dbUser.save();
          } else {
            // -- LOGIC UPDATE USER LAMA --
            let isUpdated = false;
            
            // Update Google ID jika belum ada
            if (account.provider === "google" && !dbUser.googleId) {
              dbUser.googleId = user.id;
              isUpdated = true;
            }

            // Update Avatar jika kosong
            if (!dbUser.avatarUrl) {
              dbUser.avatarUrl = user.image;
              isUpdated = true;
            }
            // Auto Verify jika login via Social
            if (!dbUser.isVerified) {
              dbUser.isVerified = true;
              isUpdated = true;
            }
            if (isUpdated) await dbUser.save();
          }

          return true;
        } catch (error) {
          console.error(`Error creating user from ${account.provider}:`, error);
          return false;
        }
      }

      return true;
    },

    // Callback JWT: Dieksekusi setiap kali session diakses/dibuat
    async jwt({ token, user, account }: any) {
      // Saat login awal (ada user & account)
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email });

        if (dbUser) {
          token.id = dbUser._id.toString();
          token.role = dbUser.role || "user";
          token.username = dbUser.username;

          // 🔥 BIKIN TOKEN BACKEND DI SINI 🔥
          // Ini triknya: Kita buat JWT manual pakai secret kita sendiri
          // supaya token ini SAMA PERSIS dengan token login manual.
          const backendToken = jwt.sign(
            { 
              userId: dbUser._id, 
              email: dbUser.email, 
              name: dbUser.name, 
              username: dbUser.username, 
              role: dbUser.role 
            },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          // Simpan token backend ini ke object token NextAuth
          token.accessToken = backendToken;
        }
      }
      return token;
    },

    // Callback Session: Meneruskan data dari token ke frontend (useSession)
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        
        // 🔥 TERUSKAN TOKEN BACKEND KE SESSION 🔥
        // Agar frontend bisa baca: const { data } = useSession(); console.log(data.accessToken);
        // @ts-ignore
        session.accessToken = token.accessToken; 
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