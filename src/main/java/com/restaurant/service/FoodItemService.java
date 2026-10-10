package com.restaurant.service;

import com.restaurant.model.FoodItemModel;
import com.restaurant.repository.FoodItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FoodItemService {

    private final FoodItemRepository foodItemRepository;

    @Autowired
    public FoodItemService(FoodItemRepository foodItemRepository) {
        this.foodItemRepository = foodItemRepository;
    }

    public List<FoodItemModel> getAllFoodItems() {
        return foodItemRepository.findAll();
    }

    public FoodItemModel getFoodItemById(Long id) {
        return foodItemRepository.findById(id).orElse(null);
    }

    public List<FoodItemModel> getFoodItemsByRestaurantId(Long restaurantId) {
        return foodItemRepository.findByRestaurantId(restaurantId);
    }

    public FoodItemModel createFoodItem(FoodItemModel foodItem) {
        return foodItemRepository.save(foodItem);
    }

    public FoodItemModel updateFoodItem(Long id, FoodItemModel foodItemDetails) {
        Optional<FoodItemModel> optionalFood = foodItemRepository.findById(id);
        if (optionalFood.isPresent()) {
            FoodItemModel existing = optionalFood.get();
            if (foodItemDetails.getName() != null) {
                existing.setName(foodItemDetails.getName());
            }
            if (foodItemDetails.getPrice() != null) {
                existing.setPrice(foodItemDetails.getPrice());
            }
            if (foodItemDetails.getRestaurantId() != null) {
                existing.setRestaurantId(foodItemDetails.getRestaurantId());
            }
            if (foodItemDetails.getRestaurantName() != null) {
                existing.setRestaurantName(foodItemDetails.getRestaurantName());
            }
            return foodItemRepository.save(existing);
        }
        return null;
    }

    public boolean deleteFoodItem(Long id) {
        if (foodItemRepository.existsById(id)) {
            foodItemRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
