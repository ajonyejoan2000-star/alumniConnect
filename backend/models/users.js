const mongoose = require('mongoose');
const { timeStamp } = require('node:console');

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim: true
    },
    email:{
        type:String,
        required:true,
        unique: true
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type: String,
        enum:["student","mentor","alumni"],
        default:"student"
    },
    bio:{
        type:String,
        default:""
    },
    course:{
        type:String,
        default:""
    },
    graduationYear:{
        type:Number,
    },
    profilePicture:{
        type:String,
        default:""
    }
},
{
    timestamps:true
})
module.exports = mongoose.model("User", userSchema);