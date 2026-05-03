package com.sumeth.spring_react_POS.service;

import com.sumeth.spring_react_POS.io.ItemRequest;
import com.sumeth.spring_react_POS.io.ItemResponse;

import java.io.IOException;
import java.util.List;

public interface ItemService {
    ItemResponse add(ItemRequest request) throws IOException;
    List<ItemResponse> getAll();
    ItemResponse getItemById(String itemId);
    ItemResponse update(String itemId, ItemRequest request) throws IOException;
    void delete(String itemId) throws IOException;
}
