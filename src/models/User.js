import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
	email : {type:String, required: true, unique: true},
	username : {type:String, required: true, unique: true},
	password : {type:String},
	name : {type:String, required: true},
	location : String,
	avatarUrl: String ,
	githubLoginOnly:{type: Boolean, default: false },
	comments: [{type: mongoose.Schema.Types.ObjectId, ref:"Comment"}],
	videos: [{type: mongoose.Schema.Types.ObjectId, ref:"Video",required:true}]
});

userSchema.pre("save", async function(){
	if (this.isModified("password")) {
		this.password = await bcrypt.hash(this.password,5); // this= user 라고 이해하면 됨
	}})

const User = mongoose.model("User",userSchema);
export default User;