package uce.edu.GestionFlota.Controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import uce.edu.GestionFlota.Model.User;
import uce.edu.GestionFlota.Service.MaintenanceService;
import uce.edu.GestionFlota.Service.UserService;
import uce.edu.GestionFlota.Service.VehicleService;

import static org.mockito.BDDMockito.given;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de Integración para el Controlador de Autenticación.
 * Verifica que el Login responda con el JSON correcto.
 */
@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @MockBean
    private VehicleService vehicleService;

    @MockBean
    private MaintenanceService maintenanceService;

    private User adminUser;

    @BeforeEach
    void setUp() {
        adminUser = new User();
        adminUser.setId(1L);
        adminUser.setUsername("admin");
        adminUser.setPassword("1234");
        adminUser.setRole("ADMIN");

    }

    @Test
    @DisplayName("POST /api/auth/login - Debe retornar éxito y token/rol si credenciales son correctas")
    void login_ShouldReturnSuccess_WhenCredentialsValid() throws Exception {
        // Arrange
        given(userService.validateCredentials("admin", "1234")).willReturn(adminUser);

        String loginJson = "{\"username\":\"admin\", \"password\":\"1234\"}";

        // Act y Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ok"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("POST /api/auth/login - Debe retornar error si credenciales son incorrectas")
    void login_ShouldReturnError_WhenCredentialsInvalid() throws Exception {
        // Arrange
        given(userService.validateCredentials("admin", "wrong")).willReturn(null);

        String loginJson = "{\"username\":\"admin\", \"password\":\"wrong\"}";

        // Act y Assert
        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(loginJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("error"))
                .andExpect(jsonPath("$.message").value("Credenciales inválidas. Intente nuevamente."));
    }
}
