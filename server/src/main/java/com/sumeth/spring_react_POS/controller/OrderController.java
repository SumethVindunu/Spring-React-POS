package com.sumeth.spring_react_POS.controller;

import com.sumeth.spring_react_POS.io.OrderRequest;
import com.sumeth.spring_react_POS.io.OrderResponce;
import com.sumeth.spring_react_POS.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // Create Order
    @PostMapping("/admin/orders")
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponce addOrder(@RequestBody OrderRequest request) throws IOException {
        return orderService.createOrder(request);
    }

    // Get All (latest first)
    @GetMapping("/admin/orders")
    public List<OrderResponce> getAllOrders() {
        return orderService.getLatestOrders();
    }



    // Delete Order
    @DeleteMapping("/admin/orders/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable String orderId) throws IOException {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}