package com.sumeth.spring_react_POS.service;

import com.sumeth.spring_react_POS.io.CategoryRequest;
import com.sumeth.spring_react_POS.io.CategoryResponce;

import java.io.IOException;
import java.util.List;

public interface CategoryService {

    CategoryResponce add(CategoryRequest request) throws IOException;

    List<CategoryResponce> getAll();

    CategoryResponce getCategoryById(String categoryId);

    CategoryResponce update(String categoryId, CategoryRequest request) throws IOException;

    void delete(String categoryId) throws IOException;
}

