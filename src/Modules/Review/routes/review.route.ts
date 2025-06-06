import { Router } from 'express';
import { Routes } from 'interface/routes.interface';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware } from 'middlewares/authMiddleware';

/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Review management endpoints
 */
export class ReviewRoute implements Routes {
    public path = '/reviews';
    public router = Router();
    public reviewController = new ReviewController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        /**
         * @swagger
         * /reviews/{id}/reviews:
         *   post:
         *     summary: Submit a review for a book
         *     tags: [Reviews]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: Book ID
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [rating]
         *             properties:
         *               rating:
         *                 type: integer
         *                 minimum: 1
         *                 maximum: 5
         *                 example: 4
         *               comment:
         *                 type: string
         *                 example: "Great read!"
         *     responses:
         *       201:
         *         description: Review added successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                   example: "success"
         *                 message:
         *                   type: string
         *                   example: "Review added successfully"
         *                 data:
         *                   $ref: '#/components/schemas/Review'
         *       401:
         *         description: Unauthorized - Invalid or missing token
         *       404:
         *         description: Book not found
         *       400:
         *         description: Review already exists for this user and book
         */
        this.router.post(`${this.path}/:id/reviews`, authMiddleware, this.reviewController.addReview);

        /**
         * @swagger
         * /reviews/{id}:
         *   put:
         *     summary: Update a review
         *     tags: [Reviews]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: Review ID
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               rating:
         *                 type: integer
         *                 minimum: 1
         *                 maximum: 5
         *                 example: 5
         *               comment:
         *                 type: string
         *                 example: "Updated review!"
         *     responses:
         *       200:
         *         description: Review updated successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                   example: "success"
         *                 message:
         *                   type: string
         *                   example: "Review updated successfully"
         *                 data:
         *                   $ref: '#/components/schemas/Review'
         *       401:
         *         description: Unauthorized - Invalid or missing token
         *       404:
         *         description: Review not found
         */
        this.router.put(`${this.path}/:id`, authMiddleware, this.reviewController.updateReview);

        /**
         * @swagger
         * /reviews/{id}:
         *   delete:
         *     summary: Delete a review
         *     tags: [Reviews]
         *     security:
         *       - bearerAuth: []
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: Review ID
         *     responses:
         *       200:
         *         description: Review deleted successfully
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 status:
         *                   type: string
         *                   example: "success"
         *                 message:
         *                   type: string
         *                   example: "Review deleted successfully"
         *       401:
         *         description: Unauthorized - Invalid or missing token
         *       404:
         *         description: Review not found
         */
        this.router.delete(`${this.path}/:id`, authMiddleware, this.reviewController.deleteReview); // Fixed missing slash
    }
}