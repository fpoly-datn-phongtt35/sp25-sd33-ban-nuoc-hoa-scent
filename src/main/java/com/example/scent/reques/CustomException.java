package com.example.scent.reques;



import org.springframework.http.HttpStatus;

public class CustomException extends RuntimeException {
    private final String userMessage; // Thông báo thân thiện hiển thị cho người dùng
    private final HttpStatus httpStatus; // Mã trạng thái HTTP (400, 403, 404, v.v.)
    private final String errorCode; // Mã lỗi để frontend xử lý logic (nếu cần)

    public CustomException(String userMessage, HttpStatus httpStatus, String errorCode) {
        super(userMessage); // Gửi userMessage lên lớp cha (RuntimeException)
        this.userMessage = userMessage;
        this.httpStatus = httpStatus;
        this.errorCode = errorCode;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public HttpStatus getHttpStatus() {
        return httpStatus;
    }

    public String getErrorCode() {
        return errorCode;
    }
}