package com.restaurant.repository;

import com.restaurant.model.FoodItemModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItemModel, Long> {
    List<FoodItemModel> findByRestaurantId(Long restaurantId);
}
