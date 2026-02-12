package uce.edu.GestionFlota.Controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;


import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import uce.edu.GestionFlota.Model.Vehicle;
import uce.edu.GestionFlota.Service.MaintenanceService;
import uce.edu.GestionFlota.Service.VehicleService;

import java.util.Arrays;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Pruebas de Integración para el Controlador de Vehículos.
 * Usa MockMvc para simular peticiones HTTP sin levantar todo el servidor.
 */
@WebMvcTest(VehicleController.class)
public class VehicleControllerTest {

    @Autowired
    private MockMvc mockMvc;

    //@MockBean
    private VehicleService vehicleService;

   // @MockBean
    private MaintenanceService maintenanceService;

    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setLicensePlate("ABC-1234");
        vehicle.setBrand("HINO");
        vehicle.setModel("FC");
        vehicle.setStatus("Available");
    }

    @Test
    @DisplayName("GET /api/vehicles - Debe retornar lista de vehículos")
    void getAllVehicles_ShouldReturnList() throws Exception {
        given(vehicleService.getAllVehicles()).willReturn(Arrays.asList(vehicle));

        mockMvc.perform(get("/api/vehicles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].licensePlate").value("ABC-1234"))
                .andExpect(jsonPath("$[0].brand").value("HINO"));
    }

    @Test
    @DisplayName("GET /api/vehicles/search/{plate} - Debe retornar vehículo si existe")
    void searchByPlate_ShouldReturnVehicle() throws Exception {
        given(vehicleService.getByLicensePlate("ABC-1234")).willReturn(Optional.of(vehicle));

        mockMvc.perform(get("/api/vehicles/search/ABC-1234"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.licensePlate").value("ABC-1234"));
    }

    @Test
    @DisplayName("POST /api/vehicles - Debe guardar y retornar vehículo")
    void saveVehicle_ShouldReturnSavedVehicle() throws Exception {
        given(vehicleService.saveVehicle(any(Vehicle.class))).willReturn(vehicle);

        // JSON simulado que envía el frontend
        String vehicleJson = "{\"licensePlate\":\"ABC-1234\", \"brand\":\"HINO\", \"model\":\"FC\"}";

        mockMvc.perform(post("/api/vehicles")
                .contentType(MediaType.APPLICATION_JSON)
                .content(vehicleJson))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.licensePlate").value("ABC-1234"));
    }

    @Test
    @DisplayName("DELETE /api/vehicles/{id} - Debe eliminar si existe")
    void deleteVehicle_ShouldReturnOk() throws Exception {
        given(vehicleService.existsById(1L)).willReturn(true);
        doNothing().when(vehicleService).deleteVehicle(1L);

        mockMvc.perform(delete("/api/vehicles/1"))
                .andExpect(status().isOk());
    }
}
