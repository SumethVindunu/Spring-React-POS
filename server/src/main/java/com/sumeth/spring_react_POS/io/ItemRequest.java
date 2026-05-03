package com.sumeth.spring_react_POS.io;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemRequest {

    private String name;
    private String description;
    private Double price;
    private Integer qty;
    private String categoryId;
    private MultipartFile image;

}
