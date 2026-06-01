
const userModel = require("../models/user.model");
const transporter =
    require("../config/nodemailer");
const bcrypt = require("bcryptjs");


async function register(req, res) {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {

            return res.json({
                success: false,
                message: "Missing Inputs"
            });

        }

        const existingUser =
            await userModel.findOne({ email });

        if (existingUser) {

            return res.json({
                success: false,
                message: "User already exists"
            });

        }

        const hashedPassword =
            await bcrypt.hash(password, 10);

        const user = await userModel.create({

            name,
            email,
            password: hashedPassword

        });

        // Generate OTP
        const otp =
            String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;

        user.verifyOtpExpireAt =
            Date.now() + 5 * 60 * 1000;

        await user.save();

        // Send Mail
        await transporter.sendMail({

            from: process.env.SENDER_EMAIL,

            to: email,

            subject: "MindSpace OTP Verification",

            text: `Your OTP is ${otp}`

        });

        // Final Response
        res.json({

            success: true,

            message: "User Registered. OTP Sent.",

            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }

        });

    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

}




async function login(req, res) {

    try {

        const { email, password } = req.body;

        if (!email || !password) {

            return res.json({
                success: false,
                message: "Missing Inputs"
            });

        }

        const user =
            await userModel.findOne({ email });

        if (!user) {

            return res.json({
                success: false,
                message: "User not found"
            });

        }

        if (!user.isAccountVerified) {

            return res.json({
                success: false,
                message: "Please verify your account first"
            });

        }


        const isMatch =
            await bcrypt.compare(password, user.password);

        if (!isMatch) {

            return res.json({
                success: false,
                message: "Invalid Password"
            });

        }


        res.json({
            success: true,
            message: "Login Successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });


    } catch (error) {

        console.log(error);

        res.json({
            success: false,
            message: "Server Error"
        });

    }

}

async function verifyOtp(req, res) {

    try {

        const { email, otp } = req.body;

        const user =
          await userModel.findOne({ email });

        if(!user){

            return res.json({
                success:false,
                message:"User not found"
            });

        }

        if(user.verifyOtp !== otp){

            return res.json({
                success:false,
                message:"Invalid OTP"
            });

        }

        if(user.verifyOtpExpireAt < Date.now()){

            return res.json({
                success:false,
                message:"OTP Expired"
            });

        }

        user.isAccountVerified = true;

        user.verifyOtp = "";

        user.verifyOtpExpireAt = 0;

        await user.save();

        res.json({
            success:true,
            message:"Account Verified Successfully"
        });

    } catch(error){

        console.log(error);

        res.json({
            success:false,
            message:"Server Error"
        });

    }

}



module.exports = {
    register,
    login,
    verifyOtp
};

