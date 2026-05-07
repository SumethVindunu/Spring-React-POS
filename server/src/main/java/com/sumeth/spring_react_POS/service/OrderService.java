package com.sumeth.spring_react_POS.service;

import java.util.List;

import com.sumeth.spring_react_POS.io.OrderRequest;
import com.sumeth.spring_react_POS.io.OrderResponce;

public interface OrderService {
    
    OrderResponce createOrder(OrderRequest request);

    void deleteOrder(String orderId);

    List<OrderResponce> getLatestOrders();
}
