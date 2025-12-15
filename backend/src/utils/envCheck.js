// src/utils/envCheck.js - Environment validation utility

/**
 * Validate required environment variables
 * @returns {Object} Validation result
 */
function validateEnvironment() {
    const required = [
        'JWT_SECRET',
        'FIREBASE_PROJECT_ID'
    ];

    const recommended = [
        'NODE_ENV',
        'PORT',
        'CORS_ORIGIN',
        'JWT_EXPIRES_IN'
    ];

    const optional = [
        'EMAIL_HOST',
        'EMAIL_PORT',
        'EMAIL_USER',
        'EMAIL_PASS',
        'RATE_LIMIT_WINDOW_MS',
        'RATE_LIMIT_MAX_REQUESTS',
        'LOG_LEVEL',
        'MAX_FILE_SIZE',
        'SENTRY_DSN',
        'NEW_RELIC_LICENSE_KEY'
    ];

    const missing = required.filter(key => !process.env[key]);
    const warnings = recommended.filter(key => !process.env[key]);

    return {
        isValid: missing.length === 0,
        missing,
        warnings,
        all: [...required, ...recommended, ...optional]
    };
}

/**
 * Log environment status
 */
function logEnvironmentStatus() {
    const validation = validateEnvironment();

    console.log('🔍 Environment Variables Check:');
    console.log('================================');

    if (validation.missing.length > 0) {
        console.log('❌ Missing Required Variables:');
        validation.missing.forEach(key => console.log(`   - ${key}`));
    } else {
        console.log('✅ All required variables are set');
    }

    if (validation.warnings.length > 0) {
        console.log('⚠️  Missing Recommended Variables:');
        validation.warnings.forEach(key => console.log(`   - ${key}`));
    }

    console.log('================================');
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`PORT: ${process.env.PORT || '5000'}`);
    console.log(`CORS_ORIGIN: ${process.env.CORS_ORIGIN || '*'}`);
    console.log('================================');

    return validation;
}

module.exports = {
    validateEnvironment,
    logEnvironmentStatus
};