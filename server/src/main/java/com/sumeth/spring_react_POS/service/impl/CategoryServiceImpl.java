package com.sumeth.spring_react_POS.service.impl;

import com.sumeth.spring_react_POS.entity.CategoryEntity;
import com.sumeth.spring_react_POS.io.CategoryRequest;
import com.sumeth.spring_react_POS.io.CategoryResponce;
import com.sumeth.spring_react_POS.repository.CategoryRepository;
import com.sumeth.spring_react_POS.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @Override
    public CategoryResponce add(CategoryRequest request) throws IOException {
        String imgUrl = null;

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imgUrl = saveImage(request.getImage());
        }
        CategoryEntity newCategory = convertToEntity(request, imgUrl);
        newCategory = categoryRepository.save(newCategory);
        return convertToResponce(newCategory);
    }

    private String saveImage(MultipartFile file) throws IOException {
        // Ensure directory exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename (e.g., "abc-123.png")
        String filename = file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);

        // Save file to disk
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // Return the relative URL (how the frontend will access it)
        // We will configure Spring to serve "uploads" folder at "/uploads/**"
        return "uploads/" + filename;
    }
    private CategoryResponce convertToResponce(CategoryEntity newCategory) {
        return CategoryResponce.builder()
                .categoryId(newCategory.getCategoryId())
                .name(newCategory.getName())
                .description(newCategory.getDescription())
                .bgColor(newCategory.getBgColor())
                .imgUrl(newCategory.getImgUrl())
                .createdAt(newCategory.getCreatedAt())
                .updatedAt(newCategory.getUpdatedAt())
                .build();
    }

    private CategoryEntity convertToEntity(CategoryRequest request, String imgUrl) {
        return CategoryEntity.builder()
                .categoryId(UUID.randomUUID().toString())
                .name(request.getName())
                .description(request.getDescription())
                .bgColor(request.getBgColor())
                .imgUrl(imgUrl)
                .build();
    }
}
