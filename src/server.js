import { error } from 'node:console';
import app from './app.js';
import {env} from './config/env.js';

app.listen(env.APP_PORT, (error) =>{
    try{
        console.log(`Server running in the port: ${env.APP_PORT}`)
        if(error){
            console.log(error);
        } 
    }catch(error){
        console.error("Error to try run a server");
    }
})