package com.sumeth.spring_react_POS.io;

import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderResponce {
    private String orderId;
    private String customerName;
    private String phoneNumber;
    private List<OrderItemRequest> items;
    private Double totalAmount;
    private Double cashReceivedived;
    private Double changeAmount;
    private String cashierName;
    private LocalDateTime createDate;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class OrderItemRequest {
        private String itemId;
        private String name;
        private Double price;
        private Integer quantity;
    }
}
