const express = require('express');
const router = express.Router();
const { register, login, forgetPassword, updatePassword } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
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
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tanisha
 *               email:
 *                 type: string
 *                 example: tanisha2@example.com
 *               password:
 *                 type: string
 *                 example: pass123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Email already registered or bad input
 */
router.post('/register', validate(['name', 'email', 'password']), register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and receive a JWT
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
 *                 example: tanisha2@example.com
 *               password:
 *                 type: string
 *                 example: pass123
 *     responses:
 *       200:
 *         description: Login successful, returns JWT token
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(['email', 'password']), login);

/**
 * @swagger
 * /api/auth/forget-password:
 *   post:
 *     summary: Send OTP to Email for password reset
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
 *                 example: tanisha2@example.com
 *     responses:
 *       200:
 *         description: OTP sent to email
 *       400:
 *         description: Email NOT FOUND
 */
router.post('/forget-password', validate(['email']), forgetPassword);

/**
 * @swagger
 * /api/auth/update-password:
 *   post:
 *     summary: Reset password using OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Email
 *               - OTP
 *               - New Password
 *               - Confirm Password
 *             properties:
 *                Email:
 *                 type: string
 *                 example: tanisha2@example.com
 *                OTP:
 *                 type: string
 *                 example: "482910"
 *                New Password:
 *                 type: string
 *                 example: newpass123
 *                Confirm Password:
 *                 type: string
 *                 example: newpass123
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Invalid OTP/Expired OTP OR Passwords do not match
 */

router.post('/update-password', validate(['email', 'otp', 'newPassword', 'confirmPassword']), updatePassword);

module.exports = router;