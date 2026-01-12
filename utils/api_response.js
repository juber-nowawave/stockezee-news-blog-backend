export function sendResponse(res, statusCode = 200, message = '', data = []) {
  return res.status(statusCode).json({
    status: statusCode === 200 ? 1 : 0,
    message,
    data
  });
}

export default { sendResponse };
