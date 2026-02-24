import mongoose from "mongoose";

const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI) {
    throw new Error("Please Define the mongoDb url in .env")
}

const MONGO_URI_STRING = MONGO_URI as string;


//Global cache to prevent multiplw connections

declare global {
    var mongoose: {
        conn: typeof import("mongoose") | null;
        promise: Promise<typeof import("mongoose")> | null;
    }
};

let cached = global.mongoose;


//if there is no cached connection then it makes the global object null
//so that when the connectDb runs it initializes the connection
if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

//db connection funcction

async function connectDB() {

    //if the connection is alsready made so return that cached connection
    if (cached.conn) {
        return cached.conn;
    }


    //"Not connecting yet? Start connecting."
    //the promise variable stores the connection promise state [pending,fulfilled,rejected]so that we dont make multiple connections
    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGO_URI_STRING, {
            bufferCommands: false,
        }).then((mongoose) => {
            return mongoose;
        })
        console.log(cached.promise)
    }

    //Now it tries for connection
    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;



}

export default connectDB;