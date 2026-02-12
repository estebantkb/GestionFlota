package uce.edu.GestionFlota.Service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uce.edu.GestionFlota.Model.User;
import uce.edu.GestionFlota.Repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

/**
 * Pruebas Unitarias para UserService.
 * Verifica la lógica de autenticación (Login).
 */
@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(1L);
        user.setUsername("admin");
        user.setPassword("1234");
        user.setRole("ADMIN");
       
    }

    @Test
    @DisplayName("Debe retornar el usuario si las credenciales son correctas")
    void validateCredentials_ShouldReturnUser_WhenCredentialsAreValid() {
        // Arrange
        when(userRepository.findByUsernameAndPassword("admin", "1234")).thenReturn(user);

        // Act
        User result = userService.validateCredentials("admin", "1234");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("admin");
        assertThat(result.getRole()).isEqualTo("ADMIN");
        verify(userRepository, times(1)).findByUsernameAndPassword("admin", "1234");
    }

    @Test
    @DisplayName("Debe retornar null si las credenciales son incorrectas")
    void validateCredentials_ShouldReturnNull_WhenCredentialsAreInvalid() {
        // Arrange
        when(userRepository.findByUsernameAndPassword("admin", "wrongpass")).thenReturn(null);

        // Act
        User result = userService.validateCredentials("admin", "wrongpass");

        // Assert
        assertThat(result).isNull();
        verify(userRepository, times(1)).findByUsernameAndPassword("admin", "wrongpass");
    }
}
