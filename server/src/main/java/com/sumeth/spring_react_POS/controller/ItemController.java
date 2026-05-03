package com.sumeth.spring_react_POS.controller;

import com.sumeth.spring_react_POS.io.ItemRequest;
import com.sumeth.spring_react_POS.io.ItemResponse;
import com.sumeth.spring_react_POS.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping(value = "/admin/items" ,consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ItemResponse addItem(@ModelAttribute ItemRequest request) throws IOException {
        return itemService.add(request);
    }

    @GetMapping("/admin/items")
    public List<ItemResponse> getAllItems() {
        return itemService.getAll();
    }

    @GetMapping("/admin/items/{itemId}")
    public ItemResponse getItemById(@PathVariable String itemId) {
        return itemService.getItemById(itemId);
    }

    @PutMapping(value = "/admin/items/{itemId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ItemResponse> updateItem(
            @PathVariable String itemId,
            @ModelAttribute ItemRequest request) throws IOException {
        ItemResponse updatedItem = itemService.update(itemId, request);
        return ResponseEntity.ok(updatedItem);
    }

    @DeleteMapping("/admin/items/{itemId}")
    public ResponseEntity<Void> deleteItem(@PathVariable String itemId) throws IOException {
        itemService.delete(itemId);
        return ResponseEntity.noContent().build();
    }
}
