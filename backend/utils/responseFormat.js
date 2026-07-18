const successResponse = (message, data = {}) => {
    return {
        success: true,
        message: message,
        data: data
    };
};

const errorResponse = (message) => {
    return {
        success: false,
        message: message
    };
};

module.exports = {
    successResponse,
    errorResponse
};
