package com.sumeth.spring_react_POS.repository;

import com.sumeth.spring_react_POS.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {
}
