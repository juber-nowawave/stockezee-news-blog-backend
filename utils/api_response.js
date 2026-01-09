export function sendResponse(res, statusCode = 200, message = '', data = []) {
  return res.status(statusCode).json({
    status: statusCode,
    message,
    data
  });
}

export function sendSuccess(res, data = [], message = 'Success', statusCode = 200) {
  return sendResponse(res, statusCode, message, data);
}

export function sendError(res, message = 'Error', statusCode = 500, data = []) {
  return sendResponse(res, statusCode, message, data);
}

export default { sendResponse, sendSuccess, sendError };
