export const HTTP_STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504,
};

/**
 * This could potentially serve as a "translation" of errors from the backend
 * to more descriptive error messages while maintaining obfuscation
 */
export const HTTP_ERROR_CODE_MAP = {
    400: 'BAD_REQUEST',
    404: 'NO_DATA_FOUND',
    500: 'SERVER_CONNECT_ERROR',
};
