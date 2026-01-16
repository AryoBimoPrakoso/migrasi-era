// lib/responseHelper.js

/**
 * Helper functions untuk standardisasi format response API.
 */

/**
 * Mengirim response sukses standar.
 * @param {object} res - Express response object
 * @param {any} data - Data yang akan dikirim
 * @param {string} message - Pesan sukses
 * @param {number} statusCode - HTTP status code (default: 200)
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Mengirim response dengan pagination.
 * @param {object} res - Express response object
 * @param {any} data - Data yang akan dikirim
 * @param {object} pagination - Info pagination { page, limit, total, hasMore, nextCursor }
 * @param {string} message - Pesan sukses
 */
const paginatedResponse = (res, data, pagination, message = 'Success') => {
    return res.status(200).json({
        success: true,
        message,
        data,
        pagination,
        timestamp: new Date().toISOString()
    });
};

/**
 * Mengirim response created (201).
 * @param {object} res - Express response object
 * @param {any} data - Data yang baru dibuat
 * @param {string} message - Pesan sukses
 */
const createdResponse = (res, data, message = 'Resource created successfully') => {
    return successResponse(res, data, message, 201);
};

module.exports = {
    successResponse,
    paginatedResponse,
    createdResponse
};