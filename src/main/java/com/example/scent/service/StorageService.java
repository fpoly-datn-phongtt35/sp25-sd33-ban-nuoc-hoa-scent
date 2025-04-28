package com.example.scent.service;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.FileContent;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.drive.Drive;
import com.google.api.services.drive.model.File;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.GoogleCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.GeneralSecurityException;
import java.util.Collections;

@Service
public class StorageService {

    private final Drive driveService;
    private final String folderId;

    // Thư mục lưu trữ cục bộ cho hình ảnh và video
    private final Path storagePath = Paths.get("uploads");

    public StorageService(@Value("${google.drive.credentials.file}") String credentialsFilePath,
                          @Value("${google.drive.folder.id}") String folderId) throws IOException, GeneralSecurityException {
        this.folderId = folderId;

        // Tạo thư mục lưu trữ cục bộ nếu chưa tồn tại
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
        }

        Resource resource = new ClassPathResource(credentialsFilePath);
        if (!resource.exists()) {
            throw new IOException("Tệp thông tin xác thực không tồn tại tại: " + credentialsFilePath);
        }
        GoogleCredentials credentials = GoogleCredentials.fromStream(resource.getInputStream())
                .createScoped(Collections.singleton("https://www.googleapis.com/auth/drive"));
        this.driveService = new Drive.Builder(
                GoogleNetHttpTransport.newTrustedTransport(),
                GsonFactory.getDefaultInstance(),
                new HttpCredentialsAdapter(credentials))
                .setApplicationName("TraHangApp")
                .build();
    }

    public String uploadImageToStorage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Tệp hình ảnh không hợp lệ hoặc rỗng");
        }
        String fileName = "images_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String googleDriveUrl = uploadFileToDrive(file, fileName, "image/jpeg");
        return downloadAndStoreFileLocally(googleDriveUrl, fileName);
    }

    public String uploadVideoToStorage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Tệp video không hợp lệ hoặc rỗng");
        }
        String fileName = "videos_" + System.currentTimeMillis() + "_" + file.getOriginalFilename();
        String googleDriveUrl = uploadFileToDrive(file, fileName, "video/mp4");
        return downloadAndStoreFileLocally(googleDriveUrl, fileName);
    }

    public String uploadVideoToStorageFromFile(java.io.File file, String originalFileName) throws IOException {
        if (!file.exists() || file.length() == 0) {
            throw new IllegalArgumentException("Tệp video không tồn tại hoặc rỗng");
        }
        String fileName = "videos_" + System.currentTimeMillis() + "_" + originalFileName;
        String googleDriveUrl = uploadFileToDriveFromFile(file, fileName, "video/mp4");
        return downloadAndStoreFileLocally(googleDriveUrl, fileName);
    }

    private String uploadFileToDrive(MultipartFile multipartFile, String fileName, String mimeType) throws IOException {
        java.io.File tempFile = java.io.File.createTempFile("temp", fileName);
        try {
            multipartFile.transferTo(tempFile);
            return uploadFileToDriveFromFile(tempFile, fileName, mimeType);
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
    }

    private String uploadFileToDriveFromFile(java.io.File file, String fileName, String mimeType) throws IOException {
        if (!file.exists() || file.length() == 0) {
            throw new IOException("Tệp không tồn tại hoặc rỗng: " + file.getAbsolutePath());
        }

        File fileMetadata = new File();
        fileMetadata.setName(fileName);
        fileMetadata.setParents(Collections.singletonList(folderId));

        FileContent mediaContent = new FileContent(mimeType, file);
        File uploadedFile = driveService.files().create(fileMetadata, mediaContent)
                .setFields("id")
                .execute();

        driveService.permissions().create(uploadedFile.getId(), new com.google.api.services.drive.model.Permission()
                        .setType("anyone")
                        .setRole("reader"))
                .execute();

        String fileId = uploadedFile.getId();
        return String.format("https://drive.google.com/uc?export=download&id=%s", fileId);
    }

    private String downloadAndStoreFileLocally(String googleDriveUrl, String fileName) throws IOException {
        // Tải tệp từ Google Drive
        URL url = new URL(googleDriveUrl);
        Path localPath = storagePath.resolve(fileName);
        try (InputStream in = url.openStream();
             OutputStream out = Files.newOutputStream(localPath)) {
            byte[] buffer = new byte[1024];
            int bytesRead;
            while ((bytesRead = in.read(buffer)) != -1) {
                out.write(buffer, 0, bytesRead);
            }
        }

        // Trả về URL cục bộ (giả sử server của bạn chạy trên localhost:8080)
        return String.format("http://localhost:8080/uploads/%s", fileName);
    }
}