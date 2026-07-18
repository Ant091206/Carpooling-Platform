/**
 * Higher-order function to wrap async Express controllers and catch errors
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
export { asyncHandler };
