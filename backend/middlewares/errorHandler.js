const { errorResponse } = require('../utils/responseFormat');

const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Prevent leaking SQL errors to the client
    if (err.sqlMessage || err.sqlState) {
        return res.status(500).json(errorResponse('A database error occurred.'));
    }

    // Default error response
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json(errorResponse(message));
};

module.exports = { errorHandler };
