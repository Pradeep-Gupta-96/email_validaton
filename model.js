import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: String,
})

const emails = new mongoose.model("emails", userSchema)

export default emails