const express = require('express');
const router = express.Router();
const { getAllProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller');
const authenticate = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints (requires login)
 */

/**
 * @swagger
 * /api/products/upload-image:
 *   post:
 *     summary: Upload a product image
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                  type: string
 *                  format: binary
 *                 
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 */
router.post('/upload-image', authenticate, upload.array('images', 10),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }
    const imageUrls = req.files.map(
      file => `${process.env.BASE_URL}/uploads/${file.filename}`
    );
    res.status(200).json({ success: true, imageUrls
    });
  }
);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all registered products
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all products
 *       401:
 *         description: Unauthorized - token missing or invalid
 *       500:
 *         description: Server error
 */
router.get('/', getAllProducts);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
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
 *                 example: chocolate
 *               realPrice:
 *                 type: number
 *                 example: 30
 *               salePrice:
 *                 type: number
 *                 example: 25
 *               category:
 *                 type: string
 *                 example: food
 *               shortDescription:
 *                 type: string
 *                 example: A delicious chocolate bar
 *               description:
 *                 type: string
 *                 example: Rich smooth flavor
 *               stock:
 *                 type: integer
 *                 example: 10
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   example: https://example.com/chocolate.jpg
 *     responses:
 *       200:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authenticate, createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               realPrice:
 *                 type: number
 *               salePrice:
 *                 type: number
 *               category:
 *                 type: string
 *               shortDescription:
 *                 type: string
 *               description:
 *                 type: string
 *               stock:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

router.put('/:id', authenticate, updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */

router.delete('/:id', authenticate, deleteProduct);



module.exports = router;