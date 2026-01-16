// lib/asyncHandler.js

/**
 * Wrapper untuk async route handlers.
 * Menangkap error dari async functions dan meneruskannya ke error middleware.
 * Menghilangkan kebutuhan try-catch di setiap controller.
 *
 * @param {Function} fn - Async function (req, res, next)
 * @returns {Function} - Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

