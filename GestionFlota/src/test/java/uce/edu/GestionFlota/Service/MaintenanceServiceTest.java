package uce.edu.GestionFlota.Service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import uce.edu.GestionFlota.Model.Maintenance;
import uce.edu.GestionFlota.Repository.MaintenanceRepository;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Pruebas Unitarias para MaintenanceService.
 * Verifica la lógica de registro y consulta de mantenimientos.
 */
@ExtendWith(MockitoExtension.class)
public class MaintenanceServiceTest {

    @Mock
    private MaintenanceRepository maintenanceRepository;

    @InjectMocks
    private MaintenanceService maintenanceService;

    private Maintenance maintenance;

    @BeforeEach
    void setUp() {
        maintenance = new Maintenance();
        maintenance.setId(1L);
        maintenance.setType("Preventivo");
        maintenance.setDescription("Cambio de Aceite");
        maintenance.setCost(50.0);
        maintenance.setDate(LocalDate.now());
        // En una prueba real, aquí setearíamos el vehículo asociado si fuera necesario
    }

    @Test
    @DisplayName("Debe guardar un mantenimiento correctamente")
    void saveMaintenance_ShouldReturnSavedMaintenance() {
        // Arrange
        when(maintenanceRepository.save(any(Maintenance.class))).thenReturn(maintenance);

        // Act
        Maintenance saved = maintenanceService.saveMaintenance(maintenance);

        // Assert
        assertThat(saved).isNotNull();
        assertThat(saved.getDescription()).isEqualTo("Cambio de Aceite");
        verify(maintenanceRepository, times(1)).save(maintenance);
    }

    @Test
    @DisplayName("Debe retornar el historial de mantenimientos de un vehículo")
    void getHistoryByVehicle_ShouldReturnList() {
        // Arrange
        Long vehicleId = 101L;
        Maintenance m2 = new Maintenance();
        m2.setId(2L);
        when(maintenanceRepository.findByVehicleIdOrderByDateDesc(vehicleId))
                .thenReturn(Arrays.asList(maintenance, m2));

        // Act
        List<Maintenance> history = maintenanceService.getHistoryByVehicle(vehicleId);

        // Assert
        assertThat(history).hasSize(2);
        verify(maintenanceRepository, times(1)).findByVehicleIdOrderByDateDesc(vehicleId);
    }

    @Test
    @DisplayName("Debe retornar todos los mantenimientos ordenados por fecha")
    void getAllMaintenances_ShouldReturnSortedList() {
        // Arrange
        when(maintenanceRepository.findAll(any(Sort.class)))
                .thenReturn(Arrays.asList(maintenance));

        // Act
        List<Maintenance> all = maintenanceService.getAllMaintenances();

        // Assert
        assertThat(all).hasSize(1);
        verify(maintenanceRepository, times(1)).findAll(any(Sort.class));
    }
}
