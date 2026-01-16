package com.sumeth.spring_react_POS.controller;


import com.sumeth.spring_react_POS.io.CategoryRequest;
import com.sumeth.spring_react_POS.io.CategoryResponce;
import com.sumeth.spring_react_POS.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponce addCategory(@ModelAttribute CategoryRequest request) throws IOException {
        return categoryService.add(request);
    }
}
