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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;


@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final Cloudinary cloudinary;
    private final String UPLOAD_DIR = "C:/Users/sumet/Desktop/project/Spring-React-POS/client/public/images/";

    @Override
    public CategoryResponce add(CategoryRequest request) throws IOException {
        String imgUrl = null;
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imgUrl = uploadToCloudinary(request.getImage());
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

        // Update fields as before...

        // Handle Image Update
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            // Delete old image from Cloudinary if exists
            if (existingCategory.getImgUrl() != null) {
                deleteFromCloudinary(existingCategory.getImgUrl());
            }
            // Upload new image
            String newImgUrl = uploadToCloudinary(request.getImage());
            existingCategory.setImgUrl(newImgUrl);
        }

        CategoryEntity updatedCategory = categoryRepository.save(existingCategory);
        return convertToResponce(updatedCategory);
    }

    @Override
    public void delete(String categoryId) throws IOException {
        CategoryEntity existingCategory = categoryRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));

        // Delete from Cloudinary if image exists
        if (existingCategory.getImgUrl() != null) {
            deleteFromCloudinary(existingCategory.getImgUrl());
        }

        categoryRepository.delete(existingCategory);
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

    // New helper: Upload to Cloudinary
    private String uploadToCloudinary(MultipartFile file) throws IOException {
        var uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", "categories"));  // Optional: Organize in a folder
        return (String) uploadResult.get("secure_url");  // Full HTTPS URL
    }

    // New helper: Delete from Cloudinary
    private void deleteFromCloudinary(String imgUrl) throws IOException {
        // Extract public ID from URL (e.g., https://res.cloudinary.com/your-cloud/image/upload/v123/categories/filename.jpg -> categories/filename)
        String publicId = imgUrl.split("/")[imgUrl.split("/").length - 1].split("\\.")[0];  // Adjust based on URL format
        if (imgUrl.contains("/categories/")) {
            publicId = "categories/" + publicId;
        }
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
