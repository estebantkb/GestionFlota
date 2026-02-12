
package uce.edu.GestionFlota.Controller;

/**
 *
 * @author USER
 */
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import uce.edu.GestionFlota.Model.Maintenance;
import uce.edu.GestionFlota.Model.Vehicle;
import uce.edu.GestionFlota.Service.MaintenanceService;
import uce.edu.GestionFlota.Service.VehicleService;

import java.util.List;

/**
 * Controlador de Vehículos.
 * Gestiona tanto los autos como sus historiales de mantenimiento.
 */
@RestController
@RequestMapping("/api/vehicles") // Ruta base en Inglés: localhost:8080/api/vehicles
@CrossOrigin(origins = "*") // Permite conexión desde React
public class VehicleController {

    // --- INYECCIÓN DE DEPENDENCIAS (LOS CHEFS) ---
    // El controlador es solo el "Mesero": recibe el pedido y se lo pasa al Servicio
    // correspondiente.

    @Autowired
    private VehicleService vehicleService; // Para lógica de carros

    @Autowired
    private MaintenanceService maintenanceService; // Para lógica de reparaciones

    // ==========================================
    // 1. VEHICLE MANAGEMENT (CRUD Básico)
    // ==========================================

    /**
     * Obtener toda la flota.
     * URL: GET /api/vehicles
     */
    @GetMapping
    public List<Vehicle> getAll() {
        return vehicleService.getAllVehicles();
    }

    /**
     * Guardar o Editar un vehículo.
     * URL: POST /api/vehicles
     */
    @PostMapping
    public Vehicle save(@RequestBody Vehicle vehicle) {
        return vehicleService.saveVehicle(vehicle);
    }

    /**
     * Eliminar un vehículo por su ID.
     * URL: DELETE /api/vehicles/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        // Primero verificamos si existe para no intentar borrar un fantasma
        if (!vehicleService.existsById(id)) {
            return ResponseEntity.notFound().build(); // Devuelve Error 404
        }
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok().build(); // Devuelve Éxito 200
    }

    // ==========================================
    // 2. SEARCH (Buscador)
    // ==========================================

    /**
     * Buscar un carro específico por su placa.
     * URL: GET /api/vehicles/search/{licensePlate}
     */
    @GetMapping("/search/{licensePlate}")
    public ResponseEntity<Vehicle> searchByPlate(@PathVariable String licensePlate) {
        // El servicio devuelve un "Optional" (puede que esté, puede que no)
        return vehicleService.getByLicensePlate(licensePlate)
                .map(ResponseEntity::ok) // Si está, devuelve 200 OK y el vehículo
                .orElse(ResponseEntity.notFound().build()); // Si no, devuelve 404 Not Found
    }

    // ==========================================
    // 3. MAINTENANCE HISTORY (Historial)
    // ==========================================

    /**
     * Registra un nuevo mantenimiento.
     * URL: POST /api/vehicles/maintenances
     */
    @PostMapping("/maintenances")
    public Maintenance saveMaintenance(@RequestBody Maintenance maintenance) {
        return maintenanceService.saveMaintenance(maintenance);
    }

    /**
     * Mira la Hoja de Vida (historial) de un solo vehículo.
     * URL: GET /api/vehicles/{id}/history
     */
    @GetMapping("/{id}/history")
    public List<Maintenance> getHistory(@PathVariable Long id) {
        return maintenanceService.getHistoryByVehicle(id);
    }

    /**
     * Reporte Global: Mira TODOS los mantenimientos de la empresa.
     * URL: GET /api/vehicles/maintenances/all
     */
    @GetMapping("/maintenances/all")
    public List<Maintenance> getAllMaintenances() {
        return maintenanceService.getAllMaintenances();
    }
}
