// common/response.js

// 성공 응답: 단순히 JSON 객체만 반환
export const successResponse = (data = null, message = "SUCCESS", status = 200) => {
  return {
    success: true,
    message,
    status,
    data,
  };
};

// 에러 응답: 이것도 JSON 객체만 반환
export const errorResponse = (message = "ERROR", status = 500, errors = null) => {
  return {
    success: false,
    message,
    status,
    errors,
  };
};
