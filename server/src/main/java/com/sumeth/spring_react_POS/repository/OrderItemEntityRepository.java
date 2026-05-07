package com.sumeth.spring_react_POS.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sumeth.spring_react_POS.entity.OrderItemEntity;

public interface OrderItemEntityRepository extends JpaRepository<OrderItemEntity, Long> {
    
}
