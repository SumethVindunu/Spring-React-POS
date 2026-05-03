package com.sumeth.spring_react_POS.io;

import lombok.Builder;
import lombok.Data;

import java.sql.Timestamp;

@Data
@Builder
public class ItemResponse {
    private String itemId;
    private String name;
    private String description;
    private Double price;
    private Integer qty;
    private String categoryId;
    private String imgUrl;
    private Timestamp createdAt;
    private Timestamp updatedAt;

}
