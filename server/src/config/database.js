import mongoose from "mongoose";
import logger from "../utils/logger.js";
import  "dotenv/config"

const connectDB = async () =>{
    try{
      const conn =   await mongoose.connect(process.env.MONGODB_URI, {
        maxPoolSize:20,
        minPoolSize:5,

        serverSelectionTimeoutMS:6000,
        socketTimeoutMS:50000,
        connectTimeoutMS:10000,
        // performance
        autoIndex:false,

        // stability
        heartbeatFrequencyMS:10000,
      })

      logger.info(`MONGODB Connected: ${conn.connection.host}`)
        console.log("database connected")

        // monitoring
        mongoose.connection.on("connected" , () => {
            logger.info("MongoDB connected")
        })
        mongoose.connection.on("error" , (err) => {
            logger.error(`MongoDB error : ${err}`)
        })
        mongoose.connection.on("disconnected" , () => {
            logger.warn(`MongoDB disconnected `)
        })
        mongoose.connection.on("reconnected" , () => {
            logger.warn(`MongoDB reconnected `)
        })

        // graceful shotdown
       const shutdown = async(signal) => {
        logger.info(`Recieved ${signal}. Closing MongoDB...`)
        await mongoose.connection.close()
        process.exit(0)
       }
      process.on("SIGINT", shutdown)
      process.on("SIGTERM", shutdown)
     return conn
    }catch(err){
        logger.error("Database connection Error: " ,err)
       throw err
    }
}

export default connectDB
