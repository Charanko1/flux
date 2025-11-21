import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        await connectDB();
        const {name, email, password} = await req.json();

        const existingUser = await User.findOne({email});
        if (existingUser) {
            return new Response(JSON.stringify({message: "Email already exists"}), {status: 400});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({name, email, password: hashedPassword});

        return new Response(JSON.stringify({message: "User registered", user}), {status: 201});
    } catch (error) {
        return new Response(JSON.stringify({error: error.message}), { status: 500 });
    }
}