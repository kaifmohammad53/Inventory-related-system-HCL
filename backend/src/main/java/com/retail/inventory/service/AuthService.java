package com.retail.inventory.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.retail.inventory.config.JwtUtils;
import com.retail.inventory.dto.GoogleLoginRequest;
import com.retail.inventory.dto.LoginRequest;
import com.retail.inventory.dto.LoginResponse;
import com.retail.inventory.dto.RegisterRequest;
import com.retail.inventory.entity.Role;
import com.retail.inventory.entity.User;
import com.retail.inventory.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${google.client.id:}")
    private String googleClientId;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtUtils jwtUtils,
                       AuditLogService auditLogService,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        if (!user.isActive()) {
            throw new BadCredentialsException("User account is inactive");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getFullName());

        auditLogService.log(user.getEmail(), "LOGIN", "USER", user.getId().toString(),
                "User successfully logged in with role: " + user.getRole().name());

        return new LoginResponse(token, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    public LoginResponse register(RegisterRequest request) {
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email address is required.");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }
        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            throw new IllegalArgumentException("Full name is required.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.findByEmail(email).isPresent()) {
            throw new IllegalArgumentException("An account with email '" + email + "' already exists.");
        }

        Role role = Role.STORE_MANAGER;
        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            try {
                role = Role.valueOf(request.getRole().trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                role = Role.STORE_MANAGER;
            }
        }

        // Security Guard: Anonymous public registration cannot create an ADMIN account
        if (role == Role.ADMIN) {
            throw new IllegalArgumentException("Administrator accounts cannot be created via public registration. Please contact an existing Administrator.");
        }

        User newUser = new User(
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getFullName().trim(),
                role,
                request.getPhone()
        );

        User savedUser = userRepository.save(newUser);

        auditLogService.log(savedUser.getEmail(), "REGISTER", "USER", savedUser.getId().toString(),
                "New user registered: " + savedUser.getFullName() + " with role: " + role.name());

        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole().name(), savedUser.getFullName());

        return new LoginResponse(token, savedUser.getEmail(), savedUser.getFullName(), savedUser.getRole().name());
    }

    public LoginResponse authenticateGoogle(GoogleLoginRequest request) {
        if (request.getIdToken() == null || request.getIdToken().trim().isEmpty()) {
            throw new BadCredentialsException("Google ID Token is required.");
        }

        String googleEmail;
        String googleName;

        try {
            // Verify Google token via Google's tokeninfo endpoint
            String verifyUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getIdToken().trim();
            ResponseEntity<String> response = restTemplate.getForEntity(verifyUrl, String.class);
            
            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new BadCredentialsException("Google token verification failed.");
            }

            JsonNode root = objectMapper.readTree(response.getBody());
            if (root.has("error_description")) {
                throw new BadCredentialsException("Google verification error: " + root.get("error_description").asText());
            }

            if (!root.has("email")) {
                throw new BadCredentialsException("Google token did not contain an email address.");
            }

            googleEmail = root.get("email").asText().toLowerCase();
            googleName = root.has("name") ? root.get("name").asText() : googleEmail.split("@")[0];

        } catch (Exception e) {
            throw new BadCredentialsException("Google authentication failed: " + e.getMessage());
        }

        Optional<User> existingUserOpt = userRepository.findByEmail(googleEmail);
        User user;

        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
            if (!user.isActive()) {
                throw new BadCredentialsException("User account is inactive.");
            }
            auditLogService.log(user.getEmail(), "GOOGLE_LOGIN", "USER", user.getId().toString(),
                    "User logged in via Google OAuth with role: " + user.getRole().name());
        } else {
            // Safe role assignment for new Google account - NEVER ADMIN
            Role role = Role.STORE_MANAGER;
            if (request.getRequestedRole() != null && !request.getRequestedRole().trim().isEmpty()) {
                try {
                    Role requested = Role.valueOf(request.getRequestedRole().trim().toUpperCase());
                    if (requested != Role.ADMIN) {
                        role = requested;
                    }
                } catch (IllegalArgumentException ignored) {}
            }

            User newUser = new User(
                    googleEmail,
                    passwordEncoder.encode(UUID.randomUUID().toString()),
                    googleName,
                    role,
                    null
            );

            user = userRepository.save(newUser);

            auditLogService.log(user.getEmail(), "GOOGLE_REGISTER", "USER", user.getId().toString(),
                    "New user onboarded via Google OAuth: " + user.getFullName() + " with role: " + role.name());
        }

        String appJwt = jwtUtils.generateToken(user.getEmail(), user.getRole().name(), user.getFullName());

        return new LoginResponse(appJwt, user.getEmail(), user.getFullName(), user.getRole().name());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
