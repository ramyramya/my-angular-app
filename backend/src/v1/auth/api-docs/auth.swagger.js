// filepath: /src/v1/auth/api-docs/auth.swagger.js

/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Sign up a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payload:
 *                 type: string
 *                 description: Encrypted user data
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid data format
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payload:
 *                 type: string
 *                 description: Encrypted user data
 *     responses:
 *       200:
 *         description: User logged in successfully
 *       400:
 *         description: Invalid username or password
 *       500:
 *         description: Internal server error
 */
