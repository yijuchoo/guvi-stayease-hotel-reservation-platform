package com.stayease.backend.security;

import com.stayease.backend.model.User;
import com.stayease.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    private final UserRepository userRepository;

    @Autowired
    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Resolves the authenticated user's MongoDB id from their JWT (which carries email as subject).
     */
    public String getCurrentUserId(Authentication authentication) {
        return getCurrentUser(authentication).getId();
    }

    /**
     * Resolves the full authenticated User document — useful when you need more than just the id
     * (e.g. checking roles directly, or displaying the user's name).
     */
    public User getCurrentUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}
