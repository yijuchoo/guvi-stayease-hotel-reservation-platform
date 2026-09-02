package com.stayease.backend.service;

import com.stayease.backend.dto.ForgotPasswordRequest;
import com.stayease.backend.dto.LoginRequest;
import com.stayease.backend.dto.RegisterRequest;
import com.stayease.backend.dto.ResetPasswordRequest;
import com.stayease.backend.model.User;
import com.stayease.backend.repository.UserRepository;
import com.stayease.backend.security.CustomUserDetailsService;
import com.stayease.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private CustomUserDetailsService userDetailsService;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private UserService userService;

    private RegisterRequest registerRequest;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setFullName("Jane Doe");
        registerRequest.setEmail("jane@example.com");
        registerRequest.setPassword("securepass123");
        registerRequest.setPhoneNumber("+6598765432");
        registerRequest.setRole("CUSTOMER");
    }

    @Test
    void registerCustomer_shouldSucceed_whenEmailNotAlreadyRegistered() {
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("securepass123")).thenReturn("hashed_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.registerCustomer(registerRequest);

        assertNotNull(result);
        assertEquals("jane@example.com", result.getEmail());
        assertEquals("hashed_password", result.getPassword());
        assertEquals(1, result.getRoles().size());
        assertEquals("CUSTOMER", result.getRoles().get(0));
        assertTrue(result.isEnabled());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void registerCustomer_shouldThrow_whenEmailAlreadyExists() {
        when(userRepository.existsByEmail("jane@example.com")).thenReturn(true);

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.registerCustomer(registerRequest));

        assertTrue(exception.getMessage().contains("already registered"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerCustomer_shouldNeverHashPasswordInPlainText() {
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode("securepass123")).thenReturn("$2a$10$hashedvalue");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        User result = userService.registerCustomer(registerRequest);

        // Confirms the raw password never gets saved directly - encode() must have been called
        verify(passwordEncoder, times(1)).encode("securepass123");
        assertNotEquals("securepass123", result.getPassword());
    }

    @Test
    void login_shouldThrow_whenCredentialsAreInvalid() {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("jane@example.com");
        loginRequest.setPassword("wrongpassword");

        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> userService.login(loginRequest));

        verify(jwtUtil, never()).generateToken(any(UserDetails.class));
    }

    // Forgot password, reset password
    @Test
    void forgotPassword_shouldGenerateTokenAndSendEmail_whenEmailExists() {
        User existingUser = new User();
        existingUser.setId("user1");
        existingUser.setEmail("jane@example.com");
        existingUser.setFullName("Jane Doe");

        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("jane@example.com");

        when(userRepository.findByEmail("jane@example.com")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.forgotPassword(request);

        verify(userRepository, times(1)).save(any(User.class));
        verify(notificationService, times(1)).sendEmail(eq("jane@example.com"), anyString(), anyString());
        assertNotNull(existingUser.getResetToken());
        assertNotNull(existingUser.getResetTokenExpiry());
    }

    @Test
    void forgotPassword_shouldDoNothing_whenEmailDoesNotExist() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("doesnotexist@example.com");

        when(userRepository.findByEmail("doesnotexist@example.com")).thenReturn(Optional.empty());

        userService.forgotPassword(request);

        // No token generated, no email sent - but also no exception thrown (prevents email enumeration)
        verify(userRepository, never()).save(any(User.class));
        verify(notificationService, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    void resetPassword_shouldSucceed_whenTokenIsValidAndNotExpired() {
        User existingUser = new User();
        existingUser.setId("user1");
        existingUser.setEmail("jane@example.com");
        existingUser.setFullName("Jane Doe");
        existingUser.setResetToken("valid-token-123");
        existingUser.setResetTokenExpiry(LocalDateTime.now().plusMinutes(10)); // still valid

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("valid-token-123");
        request.setNewPassword("newpass456");

        when(userRepository.findByResetToken("valid-token-123")).thenReturn(Optional.of(existingUser));
        when(passwordEncoder.encode("newpass456")).thenReturn("hashed_new_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.resetPassword(request);

        assertEquals("hashed_new_password", existingUser.getPassword());
        assertNull(existingUser.getResetToken()); // invalidated after use
        assertNull(existingUser.getResetTokenExpiry());
        verify(notificationService, times(1)).sendEmail(eq("jane@example.com"), anyString(), anyString());
    }

    @Test
    void resetPassword_shouldThrow_whenTokenIsExpired() {
        User existingUser = new User();
        existingUser.setResetToken("expired-token");
        existingUser.setResetTokenExpiry(LocalDateTime.now().minusMinutes(5)); // already expired

        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("expired-token");
        request.setNewPassword("newpass456");

        when(userRepository.findByResetToken("expired-token")).thenReturn(Optional.of(existingUser));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> userService.resetPassword(request));

        assertTrue(exception.getMessage().contains("Invalid or expired"));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void resetPassword_shouldThrow_whenTokenDoesNotExist() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setToken("nonexistent-token");
        request.setNewPassword("newpass456");

        when(userRepository.findByResetToken("nonexistent-token")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> userService.resetPassword(request));
        verify(userRepository, never()).save(any(User.class));
    }

}
