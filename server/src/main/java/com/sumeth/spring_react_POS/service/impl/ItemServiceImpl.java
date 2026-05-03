package com.sumeth.spring_react_POS.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.sumeth.spring_react_POS.entity.ItemEntity;
import com.sumeth.spring_react_POS.io.ItemRequest;
import com.sumeth.spring_react_POS.io.ItemResponse;
import com.sumeth.spring_react_POS.repository.ItemRepository;
import com.sumeth.spring_react_POS.service.ItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final Cloudinary cloudinary;

    @Override
    public ItemResponse add(ItemRequest request) throws IOException {
        String imgUrl = null;
        if (request.getImage() != null && !request.getImage().isEmpty()) {
            imgUrl = uploadToCloudinary(request.getImage());
        }
        ItemEntity newItem = convertToEntity(request, imgUrl);
        newItem = itemRepository.save(newItem);
        return convertToResponse(newItem);
    }

    @Override
    public List<ItemResponse> getAll() {
        return itemRepository.findAll().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ItemResponse getItemById(String itemId) {
        ItemEntity item = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + itemId));
        return convertToResponse(item);
    }

    @Override
    public ItemResponse update(String itemId, ItemRequest request) throws IOException {
        ItemEntity existingItem = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + itemId));

        if (request.getName() != null && !request.getName().isEmpty()) {
            existingItem.setName(request.getName());
        }

        if (request.getDescription() != null && !request.getDescription().isEmpty()) {
            existingItem.setDescription(request.getDescription());
        }

        if (request.getPrice() != null) {
            existingItem.setPrice(request.getPrice());
        }

        if (request.getQty() != null) {
            existingItem.setQty(request.getQty());
        }

        if (request.getCategoryId() != null && !request.getCategoryId().isEmpty()) {
            existingItem.setCategoryId(request.getCategoryId());
        }

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            if (existingItem.getImgUrl() != null) {
                deleteFromCloudinary(existingItem.getImgUrl());
            }
            String newImgUrl = uploadToCloudinary(request.getImage());
            existingItem.setImgUrl(newImgUrl);
        }

        ItemEntity updatedItem = itemRepository.save(existingItem);
        return convertToResponse(updatedItem);
    }

    @Override
    public void delete(String itemId) throws IOException {
        ItemEntity existingItem = itemRepository.findByItemId(itemId)
                .orElseThrow(() -> new RuntimeException("Item not found with ID: " + itemId));

        if (existingItem.getImgUrl() != null) {
            deleteFromCloudinary(existingItem.getImgUrl());
        }

        itemRepository.delete(existingItem);
    }

    private ItemResponse convertToResponse(ItemEntity item) {
        return ItemResponse.builder()
                .itemId(item.getItemId())
                .name(item.getName())
                .description(item.getDescription())
                .price(item.getPrice())
                .qty(item.getQty())
                .categoryId(item.getCategoryId())
                .imgUrl(item.getImgUrl())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    private ItemEntity convertToEntity(ItemRequest request, String imgUrl) {
        return ItemEntity.builder()
                .itemId(UUID.randomUUID().toString())
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .qty(request.getQty())
                .categoryId(request.getCategoryId())
                .imgUrl(imgUrl)
                .build();
    }

    private String uploadToCloudinary(MultipartFile file) throws IOException {
        var uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", "items"));
        return (String) uploadResult.get("secure_url");
    }

    private void deleteFromCloudinary(String imgUrl) throws IOException {
        String publicId = imgUrl.split("/")[imgUrl.split("/").length - 1].split("\\.")[0];
        if (imgUrl.contains("/items/")) {
            publicId = "items/" + publicId;
        }
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
