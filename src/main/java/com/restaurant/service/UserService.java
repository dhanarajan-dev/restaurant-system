package com.restaurant.service;

import com.restaurant.model.UserModel;
import com.restaurant.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserModel registerUser(UserModel user) {
        if (userRepository.existsByUsername(user.getUsername())) {
            throw new IllegalArgumentException("Username already exists!");
        }
        return userRepository.save(user);
    }

    public UserModel loginUser(String username, String password) {
        return userRepository.findByUsernameAndPassword(username, password).orElse(null);
    }

    public Optional<UserModel> getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public List<UserModel> getAllUsers() {
        return userRepository.findAll();
    }
}
