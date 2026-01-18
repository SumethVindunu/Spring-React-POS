package com.sumeth.spring_react_POS.controller;


import com.sumeth.spring_react_POS.io.CategoryRequest;
import com.sumeth.spring_react_POS.io.CategoryResponce;
import com.sumeth.spring_react_POS.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    // Create Category
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponce addCategory(@ModelAttribute CategoryRequest request) throws IOException {
        return categoryService.add(request);
    }

    // Get All
    @GetMapping
    public List<CategoryResponce> getAllCategories() {
        return categoryService.getAll();
    }

    // Get By ID
    @GetMapping("/{categoryId}")
    public CategoryResponce getCategoryById(@PathVariable String categoryId) {
        return categoryService.getCategoryById(categoryId);
    }

    // Update
    // Note: We use @ModelAttribute because we are still handling Multipart file uploads
    @PutMapping(value = "/{categoryId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<CategoryResponce> updateCategory(
            @PathVariable String categoryId,
            @ModelAttribute CategoryRequest request) throws IOException {

        CategoryResponce updatedCategory = categoryService.update(categoryId, request);
        return ResponseEntity.ok(updatedCategory);
    }

    // Delete
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable String categoryId) throws IOException {
        categoryService.delete(categoryId);
        return ResponseEntity.noContent().build();
    }

    //1.23.34
}
