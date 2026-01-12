package com.sumeth.spring_react_POS.service;

import com.sumeth.spring_react_POS.io.CategoryRequest;
import com.sumeth.spring_react_POS.io.CategoryResponce;

public interface CategoryService {

    CategoryResponce add(CategoryRequest request);
}
