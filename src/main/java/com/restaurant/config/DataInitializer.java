package com.restaurant.config;

import com.restaurant.model.FoodItemModel;
import com.restaurant.model.RestaurantModel;
import com.restaurant.model.UserModel;
import com.restaurant.repository.FoodItemRepository;
import com.restaurant.repository.RestaurantRepository;
import com.restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RestaurantRepository restaurantRepository;
    private final FoodItemRepository foodItemRepository;
    private final UserRepository userRepository;

    @Autowired
    public DataInitializer(RestaurantRepository restaurantRepository,
                           FoodItemRepository foodItemRepository,
                           UserRepository userRepository) {
        this.restaurantRepository = restaurantRepository;
        this.foodItemRepository = foodItemRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // 1. Pre-populate initial default users if not present in MySQL
        if (userRepository.count() == 0) {
            userRepository.save(new UserModel("user1", "pass123", "user1@example.com", "USER"));
            userRepository.save(new UserModel("admin", "admin123", "admin@example.com", "ADMIN", "KS cafe", "12, Temple Street, Chennai", "9876543210"));
        }

        // 2. Pre-populate initial restaurants and food items in MySQL
        if (restaurantRepository.count() == 0) {
            RestaurantModel ksCafe = new RestaurantModel("KS cafe", "12, Temple Street, Chennai", "9876543210");
            ksCafe = restaurantRepository.save(ksCafe);

            foodItemRepository.save(new FoodItemModel("Idly", 30.0, ksCafe.getId(), ksCafe.getName()));
            foodItemRepository.save(new FoodItemModel("Dosa", 50.0, ksCafe.getId(), ksCafe.getName()));
            foodItemRepository.save(new FoodItemModel("Medu Vada", 25.0, ksCafe.getId(), ksCafe.getName()));
            foodItemRepository.save(new FoodItemModel("Poori Masala", 45.0, ksCafe.getId(), ksCafe.getName()));
            foodItemRepository.save(new FoodItemModel("Filter Coffee", 20.0, ksCafe.getId(), ksCafe.getName()));

            RestaurantModel annapoorna = new RestaurantModel("Annapoorna Hotel", "45, Cross Cut Road, Coimbatore", "9842109876");
            annapoorna = restaurantRepository.save(annapoorna);

            foodItemRepository.save(new FoodItemModel("Ghee Roast Dosa", 70.0, annapoorna.getId(), annapoorna.getName()));
            foodItemRepository.save(new FoodItemModel("Ven Pongal", 40.0, annapoorna.getId(), annapoorna.getName()));
            foodItemRepository.save(new FoodItemModel("South Indian Meals", 120.0, annapoorna.getId(), annapoorna.getName()));
        }
    }
}
