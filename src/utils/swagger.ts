import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Book Review API',
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token in the format `Bearer <token>`',
                },
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Local server',
            },
            {
                url: 'https://your-deployment-domain.com/api/v1',
                description: 'Deployed production server',
            },
        ],
    },
    apis: ['./src/Modules/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
