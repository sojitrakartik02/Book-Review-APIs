import { Router } from 'express';
import { AuthController } from '../../Auth/controllers/auth.controller';
import { authMiddleware } from '../../../middlewares/authMiddleware';
import { validationMiddleware } from '../../../middlewares/validation.middleware';
import { globalRateLimiter } from '../../../middlewares/rateLimit.middleware';
import { Routes } from '../../../interface/routes.interface';
import { forgotPasswordSchema, loginSchema, resetPasswordSchema, signupSchema, verifyOtpSchema } from '../validation/auth.validation';

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication operations
 */
export class AuthRoute implements Routes {
    public router = Router();
    public authController = new AuthController();
    public path = '/auth';

    constructor() {
        this.initializeRoutes();
    }

    public initializeRoutes() {
        /**
        * @swagger
        * /auth/signup:
        *   post:
        *     summary: Register a new user
        *     tags: [Auth]
        *     requestBody:
        *       required: true
        *       content:
        *         application/json:
        *           schema:
        *             type: object
        *             required:
        *               - username
        *               - email
        *               - password
        *             properties:
        *               username:
        *                 type: string
        *               email:
        *                 type: string
        *                 format: email
        *               password:
        *                 type: string
        *                 format: password
        *     responses:
        *       201:
        *         description: User created successfully
        *         content:
        *           application/json:
        *             schema:
        *               type: object
        *               properties:
        *                 token:
        *                   type: string
        */
        this.router.post(
            `${this.path}/signup`,
            globalRateLimiter,
            validationMiddleware(signupSchema),
            this.authController.signup
        );



        /**
         * @swagger
         * /auth/signin:
         *   post:
         *     summary: User login
         *     tags: [Auth]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - email
         *               - password
         *             properties:
         *               email:
         *                 type: string
         *                 format: email
         *               password:
         *                 type: string
         *                 format: password
         *               isRememberMe:
         *                 type: boolean
         *                 default: false
         *               hasAcceptedTerms:
         *                 type: boolean
         *                 default: false    
         *     responses:
         *       200:
         *         description: Successful login
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                 message:
         *                   type: string
         *                 data:
         *                   type: object
         *                   properties:
         *                     _id:
         *                       type: string
         *                     email:
         *                       type: string
         *                     firstName:
         *                       type: string
         *                     lastName:
         *                       type: string
         *                     roleName:
         *                       type: string
         *                     status:
         *                       type: string
         *                     accessToken:
         *                       type: string
         *                     refreshToken:
         *                       type: string
         *                     profileImage:
         *                       type: object
         *                       properties:
         *                         _id:
         *                           type: string
         *                         filename:
         *                           type: string
         *                         url:
         *                           type: string
         *                         
         *       401:
         *         description: Invalid credentials or account locked
         *       403:
         *         description: Password expired
         */
        this.router.post(`${this.path}/signin`, globalRateLimiter, validationMiddleware(loginSchema), this.authController.login);

        /**
         * @swagger
         * /auth/forgot-password:
         *   post:
         *     summary: Request password reset OTP
         *     tags: [Auth]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - email
         *             properties:
         *               email:
         *                 type: string
         *                 format: email
         *     responses:
         *       200:
         *         description: OTP sent successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                 message:
         *                   type: string
         *       404:
         *         description: User not found
         */
        this.router.post(`${this.path}/forgot-password`, globalRateLimiter, validationMiddleware(forgotPasswordSchema), this.authController.forgotPassword);

        /**
         * @swagger
         * /auth/request-new-otp:
         *   post:
         *     summary: Request new OTP for password reset
         *     tags: [Auth]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - email
         *             properties:
         *               email:
         *                 type: string
         *                 format: email
         *     responses:
         *       200:
         *         description: New OTP sent successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                 message:
         *                   type: string
         *       404:
         *         description: User not found
         */
        this.router.post(`${this.path}/request-new-otp`, globalRateLimiter, this.authController.resendOtp);

        /**
         * @swagger
         * /auth/verify-otp:
         *   post:
         *     summary: Verify OTP for password reset
         *     tags: [Auth]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - email
         *               - otp
         *             properties:
         *               email:
         *                 type: string
         *                 format: email
         *               otp:
         *                 type: string
         *     responses:
         *       200:
         *         description: OTP verified successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                 message:
         *                   type: string
         *       400:
         *         description: Invalid or expired OTP
         *       404:
         *         description: User not found
         */
        this.router.post(`${this.path}/verify-otp`, globalRateLimiter, validationMiddleware(verifyOtpSchema), this.authController.verifyOTP);

        /**
         * @swagger
         * /auth/reset-password:
         *   post:
         *     summary: Reset password
         *     tags: [Auth]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - newPassword
         *               - confirmPassword
         *               - email
         *             properties:
         *               newPassword:
         *                 type: string
         *                 format: password
         *               confirmPassword:
         *                 type: string
         *                 format: password
         *               email:
         *                 type: string
         *                 format: email
         *               token:
         *                 type: string
         *     responses:
         *       200:
         *         description: Password reset successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                 message:
         *                   type: string
         *       400:
         *         description: Invalid password or passwords do not match
         *       401:
         *         description: Unauthorized or invalid token
         */
        this.router.post(`${this.path}/reset-password`, globalRateLimiter, validationMiddleware(resetPasswordSchema), this.authController.resetPassword);

        /**
         * @swagger
         * /auth/signout:
         *   post:
         *     summary: User logout
         *     tags: [Auth]
         *     security:
         *       - bearerAuth: []
         *     responses:
         *       200:
         *         description: Successfully logged out
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                 message:
         *                   type: string
         *       401:
         *         description: Unauthorized
         */
        this.router.post(`${this.path}/signout`, authMiddleware, globalRateLimiter, this.authController.logout);

        /**
         * @swagger
         * /auth/refresh-token:
         *   post:
         *     summary: Refresh access token
         *     tags: [Auth]
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required:
         *               - refreshToken
         *             properties:
         *               refreshToken:
         *                 type: string
         *     responses:
         *       200:
         *         description: New access and refresh tokens generated
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                 message:
         *                   type: string
         *                 data:
         *                   type: object
         *                   properties:
         *                     accessToken:
         *                       type: string
         *                     refreshToken:
         *                       type: string
         *       401:
         *         description: Invalid or expired refresh token
         */
        this.router.post(`${this.path}/refresh-token`, globalRateLimiter, this.authController.refreshToken);
    }
}