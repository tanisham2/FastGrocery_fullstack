const express = require('express');
const router = express.Router();

const {createOrder, getOrdersByUserId,getAllOrders} = require('../controllers/order.controller');
const authenticate = require('../middlewares/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management endpoints (requires login)
 */


/**
 * @swagger
 * /api/orders/checkout:
 *   post:
 *     summary: Create a new order after checkout
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 12345
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                       example: 67890
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *               totalAmount:
 *                 type: number
 *                 example: 250
 *               address:
 *                 type: string
 *                 example: Mumbai, India
 *     responses:
 *       201:
 *         description: Order created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/checkout', authenticate, createOrder);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Get all orders (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All orders fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/admin/orders', authenticate, getAllOrders);


/**
 * @swagger
 * /api/orders/{userId}:
 *   get:
 *     summary: Get all orders for a specific user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orders fetched successfully
 *       404:
 *         description: Orders not found
 *       500:
 *         description: Server error
 */
router.get('/:userId', authenticate, getOrdersByUserId);

module.exports = router;