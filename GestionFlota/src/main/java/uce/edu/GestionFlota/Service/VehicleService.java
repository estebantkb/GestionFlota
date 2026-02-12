
package uce.edu.GestionFlota.Service;

/**
 *
 * @author USER
 */

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uce.edu.GestionFlota.Model.Vehicle; // OJO: 'model' en minúscula
import uce.edu.GestionFlota.Repository.VehicleRepository; // OJO: 'repository' en minúscula
import uce.edu.GestionFlota.Repository.MaintenanceRepository;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import jakarta.annotation.PostConstruct;

/**
 * Servicio de Vehículos (La Lógica de Negocio).
 * Aquí es donde ponemos las reglas de la empresa antes de guardar o buscar en
 * la BD.
 * Actúa como intermediario entre el Controlador (API) y el Repositorio (BD).
 */
@Service // Le dice a Spring: "Esta clase contiene la lógica inteligente del negocio".
public class VehicleService {

    @Autowired // Inyección de Dependencias: Trae el repositorio automáticamente.
    private VehicleRepository repository;

    @Autowired
    private MaintenanceRepository maintenanceRepository;

    /**
     * Método de Inicialización Automática.
     * Se ejecuta UNA SOLA VEZ cuando Spring Boot arranca el servidor.
     * Actualiza todos los vehículos que no tienen fecha de registro.
     */
    @PostConstruct
    public void initializeExistingVehicles() {
        List<Vehicle> allVehicles = repository.findAll();
        int updatedCount = 0;

        for (Vehicle vehicle : allVehicles) {
            // Si el vehículo no tiene fecha de registro, le asignamos la fecha actual
            if (vehicle.getCreatedAt() == null) {
                vehicle.setCreatedAt(LocalDateTime.now());
                repository.save(vehicle);
                updatedCount++;
            }
        }

        if (updatedCount > 0) {
            System.out.println("✅ [INIT] Se actualizaron " + updatedCount + " vehículos con fecha de registro.");
        } else {
            System.out.println("✅ [INIT] Todos los vehículos ya tienen fecha de registro.");
        }
    }

    // ==========================================
    // MÉTODOS CRUD (Create, Read, Update, Delete)
    // ==========================================

    /**
     * Obtiene toda la lista de vehículos.
     * Útil para llenar la tabla principal en el Frontend.
     */
    public List<Vehicle> getAllVehicles() {
        return repository.findAll();
    }

    /**
     * Guardar un vehículo nuevo o actualizar uno existente.
     * Spring sabe que si el objeto trae ID es "Update", y si no trae ID es
     * "Create".
     */
    public Vehicle saveVehicle(Vehicle vehicle) {
        // AQUÍ podrías poner validaciones extra en el futuro.
        // Ejemplo: if (vehicle.getYear() < 1990) throw new Error("Auto muy viejo");
        return repository.save(vehicle);
    }

    /**
     * Elimina un vehículo de la base de datos por su ID.
     */
    /**
     * Elimina un vehículo de la base de datos por su ID.
     * Ahora es TRANSACCIONAL: Si falla algo, se deshace todo.
     */
    @Transactional
    public void deleteVehicle(Long id) {
        // 1. Primero borramos los hijos (Mantenimientos)
        maintenanceRepository.deleteByVehicleId(id);

        // 2. Luego borramos el padre (Vehículo)
        repository.deleteById(id);
    }

    // ==========================================
    // MÉTODOS DE AYUDA Y BÚSQUEDA
    // ==========================================

    /**
     * Verifica si un vehículo existe antes de intentar borrarlo o editarlo.
     * Evita errores feos de "NullPointerException".
     */
    public boolean existsById(Long id) {
        return repository.existsById(id);
    }

    /**
     * Buscar por Placa.
     * Retorna un "Optional" porque puede que el vehículo exista o puede que no.
     * Esto obliga al Controlador a manejar el caso "404 Not Found" elegantemente.
     */
    public Optional<Vehicle> getByLicensePlate(String licensePlate) {
        return repository.findByLicensePlate(licensePlate);
    }
}
