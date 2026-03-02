import "dotenv/config"

export const env = {
    APP_PORT: process.env.APP_PORT,
//Config DB POSTGRES
    DB: {
        HOST: process.env.DB_HOST,
        PORT: process.env.DB_PORT,
        USER: process.env.DB_USER,
        PASSWORD: process.env.DB_PWD,
        NAME: process.env.DB_NAME
    },
//CONFIG DB MONGO
    MONGO: {
        URI: process.env.MONGO_URI_DB
    }

}
