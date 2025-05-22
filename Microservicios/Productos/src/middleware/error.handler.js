const errorHandler = (err, req, res, next) => {
    const status = err.statusCode || 500;

    const response = {
        success: false,
        message: err.message || 'Internal Server Error'
    }

    res.status(status).json(response);
};

module.exports = errorHandler;