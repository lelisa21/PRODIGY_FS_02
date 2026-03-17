import mongoose, { mongo } from "mongoose";

const employeeSchema = new mongoose.Schema({
userId:{
   type:mongoose.Schema.Types.ObjectId,
   ref:"User" 
},
name:String,
email:String,
phone:String,
department:String,
salary:String,
joiningDate:Date,
status:{type:String, default:"active"}


}, {timestamps:true})
const Employee = mongoose.model("Employee" , employeeSchema)
export default Employee
