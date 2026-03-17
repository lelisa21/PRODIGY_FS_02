import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name:{
       type:String,
         required:[true, "Please enter your name"],
    },
    email:{
        type:String,
        required:[true, "Please enter your email"],
        unique:true,
        // validate emailformat using regex
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"]
    },
    password:{
        type:String,
        required:[true, "Please enter your password"],
        minlength:[6, "Password must be at least 6 characters long"]
    },
    role:{
        type:String,
        enum:["employee", "manager" , "admin"],
        default:"employee"
    }

}, {timestamps:true});
// index for fast access
userSchema.index({name: -1})
const User = mongoose.model("User", userSchema);

export default User
