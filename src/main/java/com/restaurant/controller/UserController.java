package com.restaurant.controller;

import com.restaurant.model.RestaurantModel;
import com.restaurant.model.UserModel;
import com.restaurant.service.RestaurantService;
import com.restaurant.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final RestaurantService restaurantService;

    @Autowired
    public UserController(UserService userService, RestaurantService restaurantService) {
        this.userService = userService;
        this.restaurantService = restaurantService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserModel user) {
        try {
            if (user.getUsername() == null || user.getUsername().trim().isEmpty() ||
                user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required."));
            }

            // Standardize role: default to USER if not specified
            String role = (user.getRole() != null && user.getRole().equalsIgnoreCase("ADMIN")) ? "ADMIN" : "USER";
            user.setRole(role);

            // If ADMIN registers with restaurant details, also create the Restaurant in MySQL
            if ("ADMIN".equals(role) && user.getRestaurantName() != null && !user.getRestaurantName().trim().isEmpty()) {
                RestaurantModel newRestaurant = new RestaurantModel(
                        user.getRestaurantName().trim(),
                        user.getLocation() != null ? user.getLocation().trim() : "Main City",
                        user.getPhone() != null ? user.getPhone().trim() : "9876543210"
                );
                restaurantService.createRestaurant(newRestaurant);
            }

            UserModel registered = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(registered);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Registration failed: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Username and password are required."));
        }

        UserModel user = userService.loginUser(username.trim(), password.trim());
        if (user != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("role", user.getRole());
            response.put("restaurantName", user.getRestaurantName());
            response.put("location", user.getLocation());
            response.put("phone", user.getPhone());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Invalid username or password."));
    }

    @GetMapping
    public ResponseEntity<?> getAllUsers(@RequestHeader(value = "X-User-Role", required = false) String roleHeader) {
        // Role-based access control: Only ADMIN can list all registered users
        if (roleHeader == null || !roleHeader.equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access Denied: Only ADMIN can view users list."));
        }
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
