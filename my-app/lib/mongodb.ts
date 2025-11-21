import mongoose, {Mongoose} from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

let cached = (globalThis as any).mongoose as MongooseCache | undefined;

if (!cached) {
    cached = {conn: null, promise: null};
    (globalThis as any).mongoose = cached;
}

export default async function connectDB(): Promise<Mongoose> {
    if (cached!.conn) {
        return cached!.conn;
    }

    if (!cached!.promise) {
        const opts = {bufferCommands: false};
        cached!.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => mongoose);
    }

    try {
        cached!.conn = await cached!.promise;
    } catch (e) {
        cached!.promise = null;
        throw e;
    }

    return cached!.conn!;
}