import { Pool } from "pg";

import { env } from "./env.js";

export let pool;

//Conect to postgres

export const conectPostgres = async () =>{
    try{
        const poolPg = new Pool({
            host: env.DB.HOST,
            port: env.DB.PORT,
            database: env.DB.NAME,
            user: env.DB.USER,
            password: env.DB.PASSWORD
        });

        await poolPg.connect();
        console.log("Postgres conection's agree!!")
        pool = poolPg;
    } catch(error){
        console.error("Error to conect with postgres");
        process.exit(1);    
    }
};
