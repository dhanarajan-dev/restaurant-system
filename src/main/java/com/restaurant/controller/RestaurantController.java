package com.restaurant.controller;

import com.restaurant.model.RestaurantModel;
import com.restaurant.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @Autowired
    public RestaurantController(RestaurantService restaurantService) {
        this.restaurantService = restaurantService;
    }

    @GetMapping
    public ResponseEntity<List<RestaurantModel>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantModel> getRestaurantById(@PathVariable Long id) {
        RestaurantModel restaurant = restaurantService.getRestaurantById(id);
        if (restaurant != null) {
            return ResponseEntity.ok(restaurant);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Role-Based Access Control: Only ADMIN can create restaurants
    @PostMapping
    public ResponseEntity<?> createRestaurant(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody RestaurantModel restaurant) {
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access Denied: Only ADMIN can create restaurants."));
        }
        RestaurantModel created = restaurantService.createRestaurant(restaurant);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Role-Based Access Control: Only ADMIN can update restaurants
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRestaurant(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody RestaurantModel restaurant) {
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access Denied: Only ADMIN can update restaurant details."));
        }
        RestaurantModel updated = restaurantService.updateRestaurant(id, restaurant);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Role-Based Access Control: Only ADMIN can delete restaurants
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRestaurant(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access Denied: Only ADMIN can delete restaurants."));
        }
        boolean deleted = restaurantService.deleteRestaurant(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Role-Based Access Control: USER places an order
    @PostMapping("/{id}/orders")
    public ResponseEntity<?> addOrder(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody Map<String, String> payload) {
        if (role != null && role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access Denied: ADMIN cannot place orders. Only USER can place food orders."));
        }
        String orderData = payload.get("orderData");
        if (orderData == null) {
            orderData = payload.toString();
        }
        RestaurantModel updated = restaurantService.addOrder(id, orderData);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Role-Based Access Control: Only ADMIN can view placed orders in Admin View
    @GetMapping("/{id}/orders")
    public ResponseEntity<?> getOrders(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access Denied: Only ADMIN can access placed orders list."));
        }
        return ResponseEntity.ok(restaurantService.getOrders(id));
    }

    // Role-Based Access Control: Only ADMIN can delete placed orders
    @DeleteMapping("/{id}/orders/{orderIndex}")
    public ResponseEntity<?> deleteOrder(
            @PathVariable Long id,
            @PathVariable int orderIndex,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access Denied: Only ADMIN can delete orders."));
        }
        boolean deleted = restaurantService.deleteOrder(id, orderIndex);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
