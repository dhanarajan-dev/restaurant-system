package com.restaurant.model;

import jakarta.persistence.*;

@Entity
@Table(name = "food_items")
public class FoodItemModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double price;

    private Long restaurantId;
    private String restaurantName;

    public FoodItemModel() {
    }

    public FoodItemModel(String name, Double price, Long restaurantId, String restaurantName) {
        this.name = name;
        this.price = price;
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
    }

    public FoodItemModel(Long id, String name, Double price, Long restaurantId, String restaurantName) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.restaurantId = restaurantId;
        this.restaurantName = restaurantName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getRestaurantName() {
        return restaurantName;
    }

    public void setRestaurantName(String restaurantName) {
        this.restaurantName = restaurantName;
    }
}
