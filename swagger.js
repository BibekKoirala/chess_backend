const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Express API Documentation', // Title of the API
    version: '1.0.0', // Version of the API
    description: 'This is the API documentation for our Express server', // Description of the API
  },
  servers: [
    {
      url: 'http://localhost:8080', // The URL of your server
    },
  ],
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  apis: ['./Modules/*/*.js'], // Path to your API route files where JSDoc comments are
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJsdoc(options);
console.log(swaggerSpec)

module.exports = (app) => {
  // Serve Swagger docs
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Serve raw JSON Swagger spec at /api-docs.json
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
