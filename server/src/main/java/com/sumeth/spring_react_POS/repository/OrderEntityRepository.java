package com.sumeth.spring_react_POS.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sumeth.spring_react_POS.entity.OrderEntity;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderEntityRepository extends JpaRepository<OrderEntity, Long >{
    Optional <OrderEntity>  findByOrderId(String orderId);

    List<OrderEntity> findAllByOrderByCreateDateDesc();
    
}
