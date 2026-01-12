package com.sumeth.spring_react_POS.service.impl;

import com.sumeth.spring_react_POS.entity.CategoryEntity;
import com.sumeth.spring_react_POS.io.CategoryRequest;
import com.sumeth.spring_react_POS.io.CategoryResponce;
import com.sumeth.spring_react_POS.repository.CategoryRepository;
import com.sumeth.spring_react_POS.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;


@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public CategoryResponce add(CategoryRequest request) {
        CategoryEntity newCategory = convertToEntity(request);
        newCategory = categoryRepository.save(newCategory);
        return convertToResponce(newCategory);
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

    private CategoryEntity convertToEntity(CategoryRequest request) {
        return CategoryEntity.builder()
                .categoryId(UUID.randomUUID().toString())
                .name(request.getName())
                .description(request.getDescription())
                .bgColor(request.getBgColor())
                .build();
    }
}
