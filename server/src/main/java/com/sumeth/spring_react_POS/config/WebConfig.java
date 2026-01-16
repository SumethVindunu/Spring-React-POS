package com.sumeth.spring_react_POS.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // This maps http://localhost:8080/uploads/filename.png
        // to the folder /server/uploads/filename.png
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}