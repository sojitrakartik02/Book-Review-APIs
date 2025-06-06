import { Router } from 'express';
import { BookController } from '../controllers/book.controller';
import { Routes } from 'interface/routes.interface';
import { authMiddleware } from 'middlewares/authMiddleware';


/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management endpoints
 */
export class BookRoute implements Routes {
    public path = '/books';
    public router = Router();
    private bookController = new BookController();

    constructor() {
        this.initializeRoutes();
    }

    private initializeRoutes() {
        /**
         * @swagger
         * /books:
         *   post:
         *     summary: Add a new book
         *     tags: [Books]
         *     security:
         *       - bearerAuth: []
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             required: [title, author, genre]
         *             properties:
         *               title:
         *                 type: string
         *                 example: "The Great Gatsby"
         *               author:
         *                 type: string
         *                 example: "F. Scott Fitzgerald"
         *               genre:
         *                 type: string
         *                 example: "Fiction"
         *               publicationDate:
         *                 type: string
         *                 format: date
         *                 example: "1925-04-10"
         *     responses:
         *       201:
         *         description: Book added successfully
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
         *                   example: "Book successfully added"
         *                 data:
         *                   $ref: '#/components/schemas/Book'
         *       401:
         *         description: Unauthorized - Invalid or missing token
         */
        this.router.post(`${this.path}`, authMiddleware, this.bookController.addBook);

        /**
         * @swagger
         * /books:
         *   get:
         *     summary: Get all books with pagination and optional filters
         *     tags: [Books]
         *     parameters:
         *       - in: query
         *         name: page
         *         schema:
         *           type: integer
         *           default: 1
         *         description: Page number
         *       - in: query
         *         name: limit
         *         schema:
         *           type: integer
         *           default: 10
         *         description: Number of books per page
         *       - in: query
         *         name: author
         *         schema:
         *           type: string
         *         description: Filter by author (case-insensitive)
         *       - in: query
         *         name: genre
         *         schema:
         *           type: string
         *         description: Filter by genre (case-insensitive)
         *     responses:
         *       200:
         *         description: List of books
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
         *                   example: "Books fetched successfully"
         *                 data:
         *                   type: object
         *                   properties:
         *                     books:
         *                       type: array
         *                       items:
         *                         $ref: '#/components/schemas/Book'
         *                     total:
         *                       type: integer
         *                     page:
         *                       type: integer
         *                     limit:
         *                       type: integer
         */
        this.router.get(`${this.path}`, this.bookController.getBooks);

        /**
         * @swagger
         * /books/{id}:
         *   get:
         *     summary: Get book details by ID with reviews
         *     tags: [Books]
         *     parameters:
         *       - in: path
         *         name: id
         *         schema:
         *           type: string
         *         required: true
         *         description: Book ID
         *       - in: query
         *         name: reviewPage
         *         schema:
         *           type: integer
         *           default: 1
         *         description: Page number for reviews
         *       - in: query
         *         name: reviewLimit
         *         schema:
         *           type: integer
         *           default: 5
         *         description: Number of reviews per page
         *     responses:
         *       200:
         *         description: Book details with reviews
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
         *                   example: "Book fetched successfully"
         *                 data:
         *                   type: object
         *                   properties:
         *                     book:
         *                       $ref: '#/components/schemas/Book'
         *                     averageRating:
         *                       type: number
         *                       example: 4.5
         *                     reviews:
         *                       type: array
         *                       items:
         *                         $ref: '#/components/schemas/Review'
         *                     totalReviews:
         *                       type: integer
         *                     reviewPage:
         *                       type: integer
         *                     reviewLimit:
         *                       type: integer
         *       404:
         *         description: Book not found
         */
        this.router.get(`${this.path}/:id`, this.bookController.getBookById);

        /**
         * @swagger
         * /books/search:
         *   get:
         *     summary: Search books by title or author
         *     tags: [Books]
         *     parameters:
         *       - in: query
         *         name: query
         *         schema:
         *           type: string
         *         required: true
         *         description: Search term for title or author (case-insensitive)
         *       - in: query
         *         name: page
         *         schema:
         *           type: integer
         *           default: 1
         *         description: Page number
         *       - in: query
         *         name: limit
         *         schema:
         *           type: integer
         *           default: 10
         *         description: Number of books per page
         *     responses:
         *       200:
         *         description: Search results
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
         *                   example: "Books search successful"
         *                 data:
         *                   type: object
         *                   properties:
         *                     books:
         *                       type: array
         *                       items:
         *                         $ref: '#/components/schemas/Book'
         *                     total:
         *                       type: integer
         *                     page:
         *                       type: integer
         *                     limit:
         *                       type: integer
         *       400:
         *         description: Missing query parameter
         */
        this.router.get(`${this.path}/search`, this.bookController.searchBooks);
    }
}