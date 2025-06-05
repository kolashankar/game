/**
 * Response Formatter Utility
 * Standardizes API response format
 */

/**
 * Format success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 */
const success = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    status: 'success',
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Format error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} errors - Error details
 */
const error = (res, statusCode = 500, message = 'Error', errors = null) => {
  const response = {
    status: 'error',
    message
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Format paginated response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination details
 */
const paginated = (
  res,
  statusCode = 200,
  message = 'Success',
  data = [],
  pagination = {}
) => {
  const response = {
    status: 'success',
    message,
    data,
    pagination: {
      page: pagination.page || 1,
      limit: pagination.limit || data.length,
      totalItems: pagination.totalItems || data.length,
      totalPages: pagination.totalPages || 1
    }
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  success,
  error,
  paginated
};
