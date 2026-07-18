const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/responseFormat');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map(err => err.msg);
        return res.status(400).json(errorResponse(extractedErrors.join(', ')));
    }
    next();
};

module.exports = validate;
