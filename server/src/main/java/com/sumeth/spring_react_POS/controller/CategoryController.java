package com.sumeth.spring_react_POS.controller;


import com.sumeth.spring_react_POS.io.CategoryRequest;
import com.sumeth.spring_react_POS.io.CategoryResponce;
import com.sumeth.spring_react_POS.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponce addCategory(@RequestBody CategoryRequest request) {
        return categoryService.add(request);
    }
}
