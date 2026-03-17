import mongoose from 'mongoose';

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,   
        })
        console.log(`database connected Successfully`)
    } catch (error) {
        console.error(`Error connecting to database: ${error.message}`)
    }
}
export default connectDB;
