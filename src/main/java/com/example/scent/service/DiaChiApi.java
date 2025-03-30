 package com.example.scent.service;
    
    
    
    
    import com.example.scent.reques.PhiVanChuyenRequest;
    import com.example.scent.respone.*;
    import com.fasterxml.jackson.core.type.TypeReference;
    import com.fasterxml.jackson.databind.ObjectMapper;
    import lombok.extern.slf4j.Slf4j;
    import org.apache.http.HttpEntity;
    import org.apache.http.HttpResponse;
    import org.apache.http.client.HttpClient;
    import org.apache.http.client.methods.HttpGet;
    import org.apache.http.client.methods.HttpPost;
    import org.apache.http.entity.StringEntity;
    import org.apache.http.impl.client.HttpClientBuilder;
    import org.apache.http.util.EntityUtils;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.stereotype.Service;
    import org.springframework.web.bind.annotation.PostMapping;
    import org.springframework.web.bind.annotation.RequestBody;
    
    import java.io.IOException;
    import java.math.BigDecimal;
    import java.util.HashMap;
    import java.util.List;
    
    @Service
    @Slf4j
    public class DiaChiApi {
    
        private static final String apiTinhThanh = "https://online-gateway.ghn.vn/shiip/public-api/master-data/province";
        private static final String apiQuanHuyen = "https://online-gateway.ghn.vn/shiip/public-api/master-data/district";
        private static final String apiPhuongXa = "https://online-gateway.ghn.vn/shiip/public-api/master-data/ward";
        private static final String FeeAPI = "https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee";
    
        // Lấy danh sách tỉnh
        public static HashMap<Integer, String> callGetTinhThanhAPI() throws Exception {
            HttpClient httpClient = HttpClientBuilder.create().build();
            HttpGet httpGet = new HttpGet(apiTinhThanh);
            httpGet.setHeader("Token", Constant.TOKEN);
            httpGet.setHeader("Content-Type", Constant.CONTENT_TYPE);
            HttpResponse response = httpClient.execute(httpGet);
            int statusCode = response.getStatusLine().getStatusCode();
    
            if (statusCode != 200) {
                System.out.println("Error: Unable to fetch Tinh data. Status code: " + statusCode);
                return new HashMap<>();  // Trả về danh sách rỗng khi lỗi xảy ra
            } else {

                HttpEntity entity = response.getEntity();
                String responseBody = EntityUtils.toString(entity);
                System.out.println("Response from GHN API for Tinh: " + responseBody);
    
                // Kiểm tra nếu có dữ liệu trả về
                if (responseBody == null || responseBody.isEmpty()) {
                    System.out.println("No data for Tinh received.");
                    return new HashMap<>();  // Trả về danh sách rỗng khi không có dữ liệu
                }
    
                // Phân tích dữ liệu từ response
                ObjectMapper objectMapper = new ObjectMapper();
                ApiResponseList<TinhThanhResponse> responseObject = objectMapper.readValue(responseBody, new TypeReference<ApiResponseList<TinhThanhResponse>>() {});
    
                if (responseObject == null || responseObject.getData() == null || responseObject.getData().isEmpty()) {
                    System.out.println("No Tinh data available.");
                    return new HashMap<>();  // Trả về danh sách rỗng khi không có dữ liệu
                }
    
                List<TinhThanhResponse> listTinhThanh = responseObject.getData();
                HashMap<Integer, String> hashMapTinhThanh = new HashMap<>();
                for (TinhThanhResponse data : listTinhThanh) {
                    hashMapTinhThanh.put(data.getProvinceID(), data.getProvinceName());
                }
    
                return hashMapTinhThanh;
            }
        }
    
        // Lấy danh sách quận huyện
        public static HashMap<String, String> callGetQuanHuyenAPI(Integer idTinhThanh) throws Exception {
            int retries = 3;  // Số lần thử lại khi kết nối thất bại
            while (retries > 0) {
                try {
                    // Tạo HttpClient để gửi request
                    HttpClient httpClient = HttpClientBuilder.create().build();
                    HttpPost httpPost = new HttpPost(apiQuanHuyen);
                    httpPost.setHeader("Token", Constant.TOKEN);
                    httpPost.setHeader("Content-Type", Constant.CONTENT_TYPE);
    
                    // Tạo body request
                    String body = "{ \"province_id\":" + idTinhThanh + " }";
                    StringEntity requestEntity = new StringEntity(body);
                    httpPost.setEntity(requestEntity);
    
                    // Thực thi request và lấy phản hồi
                    HttpResponse response = httpClient.execute(httpPost);
                    HttpEntity entity = response.getEntity();
                    String responseBody = EntityUtils.toString(entity);
    
                    // Sử dụng ObjectMapper để chuyển đổi response thành đối tượng Java
                    ObjectMapper objectMapper = new ObjectMapper();
    
                    // Ánh xạ dữ liệu từ JSON thành ApiResponseList<QuanHuyenResponse>
                    ApiResponseList<QuanHuyenResponse> responseObject = objectMapper.readValue(responseBody,
                            new TypeReference<ApiResponseList<QuanHuyenResponse>>() {});
    
                    // Lấy danh sách Quận/Huyện từ response
                    List<QuanHuyenResponse> listQuanHuyen = responseObject.getData();
    
                    // Tạo HashMap để lưu trữ thông tin quận/huyện
                    HashMap<String, String> hashMapQuanHuyen = new HashMap<>();
    
                    // Duyệt qua danh sách Quận/Huyện và đưa vào HashMap
                    for (QuanHuyenResponse data : listQuanHuyen) {
                        hashMapQuanHuyen.put(data.getMaQuan().toString(), data.getTenQuan());
                    }
    
                    return hashMapQuanHuyen;
    
                } catch (IOException e) {
                    retries--;  // Giảm số lần thử lại
                    log.warn("Connection failed. Retrying... {} retries left", retries);
                    if (retries == 0) {
                        log.error("API call failed after 3 retries", e);
                        throw new RuntimeException("Failed to connect to GHN API after retries.");
                    }
                    // Thử lại sau 2 giây
                    Thread.sleep(2000);
                }
            }
            return new HashMap<>();  // Trả về HashMap trống nếu không kết nối được
        }
    
    
        // Lấy danh sách phường xã
        public static HashMap<String, String> callGetPhuongXaAPI(Integer idQuanHuyen) throws Exception {
            // Tạo HttpClient để gửi request
            HttpClient httpClient = HttpClientBuilder.create().build();
            HttpPost httpPost = new HttpPost(apiPhuongXa);
            httpPost.setHeader("Token", Constant.TOKEN);
            httpPost.setHeader("Content-Type", Constant.CONTENT_TYPE);
    
            // Tạo body cho request
            String body = "{\"district_id\":" + idQuanHuyen + "}";
            StringEntity requestEntity = new StringEntity(body);
            httpPost.setEntity(requestEntity);
    
            // Gửi request và nhận response
            HttpResponse response = httpClient.execute(httpPost);
            HttpEntity entity = response.getEntity();
            String responseBody = EntityUtils.toString(entity);
    
            // Xử lý response với ObjectMapper
            ObjectMapper objectMapper = new ObjectMapper();
            ApiResponseList<PhuongXaResponse> responseObject = objectMapper.readValue(responseBody,
                    new TypeReference<ApiResponseList<PhuongXaResponse>>() {});
    
            List<PhuongXaResponse> listPhuongXa = responseObject.getData();
    
            // Kiểm tra nếu listPhuongXa là null hoặc trống
            if (listPhuongXa == null || listPhuongXa.isEmpty()) {
                log.warn("No phuong xa found for district ID: {}", idQuanHuyen);
                return new HashMap<>(); // Trả về danh sách trống
            }
    
            // Tạo HashMap để lưu trữ kết quả
            HashMap<String, String> hashMapPhuongXa = new HashMap<>();
            for (PhuongXaResponse data : listPhuongXa) {
                hashMapPhuongXa.put(String.valueOf(data.getMaPhuong()), data.getTenPhuong());
            }
            return hashMapPhuongXa;
        }
    
        public static BigDecimal getFee(PhiVanChuyenRequest request) throws Exception {
            HttpClient httpClient = HttpClientBuilder.create().build();
            HttpPost httpPost = new HttpPost(FeeAPI);
            httpPost.setHeader("Token", Constant.TOKEN);
            httpPost.setHeader("shop_id", String.valueOf(Constant.ID_SHOP));
            httpPost.setHeader("Content-Type", Constant.CONTENT_TYPE);
    
            try {
                // Validate request fields
                if (request.getIdQuanHuyen() == null || request.getStringPhuongXa() == null || request.getTrungBinhCacCanh() == 0) {
                    throw new IllegalArgumentException("Invalid request data: Missing required fields.");
                }
    
                // Build request body
                StringBuilder body = new StringBuilder("{ \"to_district_id\":" + request.getIdQuanHuyen() + " ,");
                body.append(" \"to_ward_code\": \"").append(request.getStringPhuongXa()).append("\" ,");
                body.append(" \"service_type_id\": 2 ,"); // Loại dịch vụ (the service type is set to 2 as in your example)
                body.append(" \"height\":").append(request.getTrungBinhCacCanh()).append(" ,");
                body.append(" \"length\":").append(request.getTrungBinhCacCanh()).append(" ,");
                body.append(" \"width\":").append(request.getTrungBinhCacCanh()).append(" ,");
                body.append(" \"weight\":").append(request.getSoLuongSanPham() * Constant.TRONG_LUONG_SAN_PHAM).append(" }");
    
                // Set the request entity
                StringEntity requestEntity = new StringEntity(body.toString());
                httpPost.setEntity(requestEntity);
    
                // Execute the request
                HttpResponse response = httpClient.execute(httpPost);
                int statusCode = response.getStatusLine().getStatusCode();
    
                // If the response is not successful, log the error and return zero
                if (statusCode != 200) {
                    String responseBody = EntityUtils.toString(response.getEntity());
                    System.out.println("Error: Received non-OK response from the API. Status code: " + statusCode);
                    System.out.println("Response Body: " + responseBody);
                    return BigDecimal.ZERO;  // Return zero for failed requests
                }
    
                // Parse the response
                HttpEntity entity = response.getEntity();
                String responseBody = EntityUtils.toString(entity);
                System.out.println("Response Body: " + responseBody);  // Log the response body for debugging
    
                // Deserialize the response into an ApiResponseSingle object
                ObjectMapper objectMapper = new ObjectMapper();
                ApiResponseSingle<PhiVanChuyenResponse> responseObject = objectMapper.readValue(responseBody, new TypeReference<ApiResponseSingle<PhiVanChuyenResponse>>() {});
                PhiVanChuyenResponse thongTinPhi = responseObject.getData();
    
                // Check if the fee data is valid
                if (thongTinPhi != null && thongTinPhi.getTotal() != null) {
                    return BigDecimal.valueOf(thongTinPhi.getTotal());  // Return the fee as BigDecimal
                } else {
                    System.out.println("Error: Invalid fee data received.");
                    return BigDecimal.ZERO;  // Return zero if no valid fee data
                }
            } catch (IllegalArgumentException e) {
                // Handle invalid request data (e.g., missing required fields)
                System.out.println("Invalid request data: " + e.getMessage());
                return BigDecimal.ZERO;
            } catch (IOException e) {
                // Handle any IO exceptions (e.g., network
                // issues)
                System.out.println("Error during API request: " + e.getMessage());
                return BigDecimal.ZERO;
            } catch (Exception e) {
                // Catch any other exceptions
                System.out.println("Unexpected error: " + e.getMessage());
                return BigDecimal.ZERO;
            }
        }
    
    
    }
