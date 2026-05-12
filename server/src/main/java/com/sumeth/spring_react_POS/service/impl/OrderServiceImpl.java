package com.sumeth.spring_react_POS.service.impl;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.sumeth.spring_react_POS.entity.ItemEntity;
import com.sumeth.spring_react_POS.entity.OrderEntity;
import com.sumeth.spring_react_POS.entity.OrderItemEntity;
import com.sumeth.spring_react_POS.io.OrderRequest;
import com.sumeth.spring_react_POS.io.OrderResponce;
import com.sumeth.spring_react_POS.repository.ItemRepository;
import com.sumeth.spring_react_POS.repository.OrderEntityRepository;
import com.sumeth.spring_react_POS.service.OrderService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderEntityRepository orderEntityRepository;
    private final ItemRepository itemRepository;

    @Override
    public OrderResponce createOrder(OrderRequest request) {
        OrderEntity newOrder = convertToOrderEntity(request);

        List<OrderItemEntity> items = request.getCartItems().stream()
                .map(this::convertToOrderItemEntity)
                .collect(Collectors.toList());

        // Reduce item quantity from inventory
        for (OrderRequest.OrderItemRequest cartItem : request.getCartItems()) {
            ItemEntity item = itemRepository.findByItemId(cartItem.getItemId())
                    .orElseThrow(() -> new RuntimeException("Item not found: " + cartItem.getItemId()));
            item.setQty(item.getQty() - cartItem.getQuantity());
            itemRepository.save(item);
        }

        newOrder.getItems().addAll(items);

        OrderEntity saved = orderEntityRepository.save(newOrder);
        return convertToOrderResponse(saved);
    }

    @Override
    public void deleteOrder(String orderId) {
        OrderEntity entity = orderEntityRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));
        orderEntityRepository.delete(entity);
    }

    @Override
    public List<OrderResponce> getLatestOrders() {
        return orderEntityRepository.findAll().stream()
                .sorted(Comparator.comparing(OrderEntity::getCreateDate, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    // --- mapping helpers ---

    private OrderEntity convertToOrderEntity(OrderRequest request) {
        OrderEntity order = OrderEntity.builder()
                .customerName(request.getCustomerName())
                .phoneNumber(request.getPhoneNumber())
                .totalAmount(request.getTotalAmount())
                .cashReceivedived(request.getCashReceivedived())
                .changeAmount(request.getChangeAmount())
                .cashierName(request.getCashierName())
                // items and orderId/createDate are handled elsewhere / by JPA lifecycle
                .build();

        // ensure items list is initialized (builder may leave it null)
        if (order.getItems() == null) {
            order.setItems(new ArrayList<>());
        }

        return order;
    }

    private OrderItemEntity convertToOrderItemEntity(OrderRequest.OrderItemRequest item) {
        return OrderItemEntity.builder()
                .itemId(item.getItemId())
                .name(item.getName())
                .price(item.getPrice())
                .quantity(item.getQuantity())
                .build();
    }

    private OrderResponce convertToOrderResponse(OrderEntity entity) {
        List<OrderResponce.OrderItemRequest> items = entity.getItems().stream()
                .map(i -> OrderResponce.OrderItemRequest.builder()
                        .itemId(i.getItemId())
                        .name(i.getName())
                        .price(i.getPrice())
                        .quantity(i.getQuantity())
                        .build())
                .collect(Collectors.toList());

        return OrderResponce.builder()
                .orderId(entity.getOrderId())
                .customerName(entity.getCustomerName())
                .phoneNumber(entity.getPhoneNumber())
                .items(items)
                .totalAmount(entity.getTotalAmount())
                .cashReceivedived(entity.getCashReceivedived())
                .changeAmount(entity.getChangeAmount())
                .cashierName(entity.getCashierName()) 
                .createDate(entity.getCreateDate())
                .build();
    }
}