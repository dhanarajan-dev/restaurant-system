package com.restaurant.service;

import com.restaurant.model.RestaurantModel;
import com.restaurant.repository.RestaurantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;

    @Autowired
    public RestaurantService(RestaurantRepository restaurantRepository) {
        this.restaurantRepository = restaurantRepository;
    }

    public List<RestaurantModel> getAllRestaurants() {
        return restaurantRepository.findAll();
    }

    public RestaurantModel getRestaurantById(Long id) {
        return restaurantRepository.findById(id).orElse(null);
    }

    public RestaurantModel createRestaurant(RestaurantModel restaurant) {
        return restaurantRepository.save(restaurant);
    }

    public RestaurantModel updateRestaurant(Long id, RestaurantModel restaurantDetails) {
        Optional<RestaurantModel> optionalRestaurant = restaurantRepository.findById(id);
        if (optionalRestaurant.isPresent()) {
            RestaurantModel existing = optionalRestaurant.get();
            if (restaurantDetails.getName() != null) {
                existing.setName(restaurantDetails.getName());
            }
            if (restaurantDetails.getLocation() != null) {
                existing.setLocation(restaurantDetails.getLocation());
            }
            if (restaurantDetails.getPhone() != null) {
                existing.setPhone(restaurantDetails.getPhone());
            }
            return restaurantRepository.save(existing);
        }
        return null;
    }

    public boolean deleteRestaurant(Long id) {
        if (restaurantRepository.existsById(id)) {
            restaurantRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public RestaurantModel addOrder(Long restaurantId, String orderData) {
        Optional<RestaurantModel> optionalRestaurant = restaurantRepository.findById(restaurantId);
        if (optionalRestaurant.isPresent()) {
            RestaurantModel restaurant = optionalRestaurant.get();
            restaurant.getOrders().add(orderData);
            return restaurantRepository.save(restaurant);
        }
        return null;
    }

    public List<String> getOrders(Long restaurantId) {
        Optional<RestaurantModel> optionalRestaurant = restaurantRepository.findById(restaurantId);
        return optionalRestaurant.map(RestaurantModel::getOrders).orElse(new ArrayList<>());
    }

    public boolean deleteOrder(Long restaurantId, int orderIndex) {
        Optional<RestaurantModel> optionalRestaurant = restaurantRepository.findById(restaurantId);
        if (optionalRestaurant.isPresent()) {
            RestaurantModel restaurant = optionalRestaurant.get();
            if (orderIndex >= 0 && orderIndex < restaurant.getOrders().size()) {
                restaurant.getOrders().remove(orderIndex);
                restaurantRepository.save(restaurant);
                return true;
            }
        }
        return false;
    }
}
