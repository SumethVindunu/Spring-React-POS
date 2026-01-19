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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final String UPLOAD_DIR = "C:/Users/sumet/Desktop/project/Spring-React-POS/client/public/images/";

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

    @Override
    public List<CategoryResponce> getAll() {
        return categoryRepository.findAll().stream()
                .map(this::convertToResponce)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryResponce getCategoryById(String categoryId) {
        CategoryEntity category = categoryRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
        return convertToResponce(category);
    }

    @Override
    public CategoryResponce update(String categoryId, CategoryRequest request) throws IOException {
        CategoryEntity existingCategory = categoryRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));

        // 1. Check if name is sent. If yes, update it. If no, keep the old one.
        if (request.getName() != null && !request.getName().isEmpty()) {
            existingCategory.setName(request.getName());
        }

        // 2. Check if description is sent.
        if (request.getDescription() != null && !request.getDescription().isEmpty()) {
            existingCategory.setDescription(request.getDescription());
        }

        // 3. Check if bgColor is sent.
        if (request.getBgColor() != null && !request.getBgColor().isEmpty()) {
            existingCategory.setBgColor(request.getBgColor());
        }

        // Handle Image Update
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            // 1. Delete old image if it exists
            if (existingCategory.getImgUrl() != null) {
                deleteImageFile(existingCategory.getImgUrl());
            }
            // 2. Save new image
            String newImgUrl = saveImage(request.getImage());
            existingCategory.setImgUrl(newImgUrl);
        }

        CategoryEntity updatedCategory = categoryRepository.save(existingCategory);
        return convertToResponce(updatedCategory);
    }

    @Override
    public void delete(String categoryId) throws IOException {
        CategoryEntity existingCategory = categoryRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));

        // Delete the associated image file from disk
        if (existingCategory.getImgUrl() != null) {
            deleteImageFile(existingCategory.getImgUrl());
        }

        categoryRepository.delete(existingCategory);
    }

    private void deleteImageFile(String imgUrl) throws IOException {

        String filename = imgUrl.substring(imgUrl.lastIndexOf("/") + 1);
        Path filePath = Paths.get(UPLOAD_DIR).resolve(filename);

        Files.deleteIfExists(filePath);
    }
    private String saveImage(MultipartFile file) throws IOException {
        // Ensure directory exists
        Path uploadPath = Paths.get(UPLOAD_DIR);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String filename = file.getOriginalFilename();
        Path filePath = uploadPath.resolve(filename);

        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        return "/images/" + filename;
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
