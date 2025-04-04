package com.example.scent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)

@SpringBootApplication
@EnableAsync
public class ScentApplication {

    public static void main(String[] args) {
        SpringApplication.run(ScentApplication.class, args);
    }

}
