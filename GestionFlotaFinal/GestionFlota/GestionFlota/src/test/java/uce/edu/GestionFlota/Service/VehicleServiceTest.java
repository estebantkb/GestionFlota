package uce.edu.GestionFlota.Service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import uce.edu.GestionFlota.Model.Vehicle;
import uce.edu.GestionFlota.Repository.MaintenanceRepository;
import uce.edu.GestionFlota.Repository.VehicleRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/*
 * Pruebas Unitarias para VehicleService (TDD).
 */
@ExtendWith(MockitoExtension.class)
public class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        vehicle = new Vehicle();
        vehicle.setId(1L);
        vehicle.setLicensePlate("ABC-1234");
        vehicle.setBrand("HINO");
        vehicle.setModel("FC");
        vehicle.setYear(2023);
        vehicle.setStatus("Available");
        vehicle.setMileage(15000.0);
        vehicle.setCreatedAt(LocalDateTime.now());
    }

    @Test
    @DisplayName("Debe guardar un vehículo correctamente")
    void saveVehicle_ShouldReturnSavedVehicle() {
        when(vehicleRepository.save(any(Vehicle.class))).thenReturn(vehicle);
        Vehicle savedVehicle = vehicleService.saveVehicle(vehicle);
        assertThat(savedVehicle).isNotNull();
        assertThat(savedVehicle.getLicensePlate()).isEqualTo("ABC-1234");
        verify(vehicleRepository, times(1)).save(vehicle);
    }

    @Test
    @DisplayName("Debe retornar la lista de todos los vehículos")
    void getAllVehicles_ShouldReturnList() {
        Vehicle v2 = new Vehicle();
        v2.setId(2L);
        when(vehicleRepository.findAll()).thenReturn(Arrays.asList(vehicle, v2));
        List<Vehicle> vehicles = vehicleService.getAllVehicles();
        assertThat(vehicles).hasSize(2);
        verify(vehicleRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Debe buscar un vehículo por placa existente")
    void getByLicensePlate_ShouldReturnVehicle_WhenExists() {
        when(vehicleRepository.findByLicensePlate("ABC-1234")).thenReturn(Optional.of(vehicle));
        Optional<Vehicle> found = vehicleService.getByLicensePlate("ABC-1234");
        assertThat(found).isPresent();
        assertThat(found.get().getBrand()).isEqualTo("HINO");
    }

    @Test
    @DisplayName("Debe eliminar un vehículo y sus mantenimientos relacionados")
    void deleteVehicle_ShouldCallDeleteOnRepositories() {
        Long vehicleId = 1L;
        doNothing().when(maintenanceRepository).deleteByVehicleId(vehicleId);
        doNothing().when(vehicleRepository).deleteById(vehicleId);
        vehicleService.deleteVehicle(vehicleId);
        verify(maintenanceRepository, times(1)).deleteByVehicleId(vehicleId);
        verify(vehicleRepository, times(1)).deleteById(vehicleId);
    }
}
