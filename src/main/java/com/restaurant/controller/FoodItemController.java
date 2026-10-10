package com.restaurant.controller;

import com.restaurant.model.FoodItemModel;
import com.restaurant.service.FoodItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fooditems")
@CrossOrigin(origins = "*")
public class FoodItemController {

    private final FoodItemService foodItemService;

    @Autowired
    public FoodItemController(FoodItemService foodItemService) {
        this.foodItemService = foodItemService;
    }

    @GetMapping
    public ResponseEntity<List<FoodItemModel>> getAllFoodItems() {
        return ResponseEntity.ok(foodItemService.getAllFoodItems());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FoodItemModel> getFoodItemById(@PathVariable Long id) {
        FoodItemModel foodItem = foodItemService.getFoodItemById(id);
        if (foodItem != null) {
            return ResponseEntity.ok(foodItem);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    @GetMapping("/restaurant/{restaurantId}")
    public ResponseEntity<List<FoodItemModel>> getFoodItemsByRestaurantId(@PathVariable Long restaurantId) {
        return ResponseEntity.ok(foodItemService.getFoodItemsByRestaurantId(restaurantId));
    }

    // Role-Based Access Control: Only ADMIN can add food items
    @PostMapping
    public ResponseEntity<?> createFoodItem(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody FoodItemModel foodItem) {
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access Denied: Only ADMIN can add food items."));
        }
        FoodItemModel created = foodItemService.createFoodItem(foodItem);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // Role-Based Access Control: Only ADMIN can update food items
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFoodItem(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestBody FoodItemModel foodItem) {
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access Denied: Only ADMIN can update food items."));
        }
        FoodItemModel updated = foodItemService.updateFoodItem(id, foodItem);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }

    // Role-Based Access Control: Only ADMIN can delete food items
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFoodItem(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Role", required = false) String role) {
        if (role == null || !role.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access Denied: Only ADMIN can delete food items."));
        }
        boolean deleted = foodItemService.deleteFoodItem(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    }
}
