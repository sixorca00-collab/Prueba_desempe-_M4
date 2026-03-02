import mongoose from "mongoose"; 

import { env } from "./env.js";

export const connectMongo = async () =>{
    try{
        await mongoose.connect(env.MONGO.URI);

        console.log("Connection with Mongo's agree!!");
    } catch (error){
        console.error("Error to connect with mongo.");
        process.exit(1);        
    }
}