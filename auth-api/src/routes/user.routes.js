const express = require('express');
const router = express.Router();
const { getAllUsers } = require('../controllers/user.controller');
const authenticate = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints (requires login)
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all registered users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error
 */
router.get('/', authenticate, getAllUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Get all registered users with filters
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tanisha
 *               email:
 *                 type: string
 *                 example: tanisha
 *               sortBy:
 *                 type: string
 *                 example: createdAt
 *               order:
 *                 type: string
 *                 example: asc
 *               page:
 *                 type: integer
 *                 example: 1
 *               limit:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Filtered list of users
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, getAllUsers);

module.exports = router;