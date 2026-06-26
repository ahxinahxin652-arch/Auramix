package com.son.auramix;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class AuramixApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuramixApplication.class, args);
    }

}
