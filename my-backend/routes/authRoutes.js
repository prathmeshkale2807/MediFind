import express from "express";

import {
    registerUser,
    verifyEmail,
    resendVerificationOTP,
    loginUser,
    logoutUser,
    forgotPassword,
    verifyResetOTP,
    resetPassword
} from "../controllers/authController.js";

const router = express.Router();

console.log("✅ AUTH ROUTES LOADED");

router.get("/test", (req, res) => {
    res.json({
        message: "Auth route is working"
    });
});

router.post(
    "/register",
    registerUser
);

router.post(
    "/verify-email",
    verifyEmail
);

router.post(
    "/resend-verification",
    resendVerificationOTP
);

router.post(
    "/login",
    loginUser
);

router.post(
    "/logout",
    logoutUser
);

router.post(
    "/forgot-password",
    forgotPassword
);

router.post(
    "/verify-reset-otp",
    verifyResetOTP
);

router.post(
    "/reset-password",
    resetPassword
);

export default router;