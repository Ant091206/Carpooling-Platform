/**
 * Standardized success response utility
 */
class ApiResponse {
  constructor(statusCode, data = null, message = 'Success') {
    this.statusCode = statusCode;
    this.success = true;
    this.message = message;
    if (data !== null) {
      this.data = data;
    }
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      ...(this.data ? { data: this.data } : {})
    });
  }
}

export default ApiResponse;
export { ApiResponse };
