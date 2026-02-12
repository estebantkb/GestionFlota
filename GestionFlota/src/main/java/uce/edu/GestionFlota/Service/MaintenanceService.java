
package uce.edu.GestionFlota.Service;

/**
 *
 * @author USER
 */
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


import java.util.List;
import uce.edu.GestionFlota.Model.Maintenance;
import uce.edu.GestionFlota.Repository.MaintenanceRepository;

/**
 * Servicio de Mantenimiento.
 * Contiene la lógica para registrar reparaciones y consultar historiales.
 */
@Service
public class MaintenanceService {

    @Autowired
    private MaintenanceRepository repository;

    // ==========================================
    // MÉTODO 1: GUARDAR (Save)
    // ==========================================
    /**
     * Registra un nuevo mantenimiento en la base de datos.
     * Este es el método que te faltaba llamar 'saveMaintenance'.
     */
    public Maintenance saveMaintenance(Maintenance maintenance) {
        return repository.save(maintenance);
    }

    // ==========================================
    // MÉTODO 2: HISTORIAL POR VEHÍCULO (History)
    // ==========================================
    /**
     * Busca todos los mantenimientos de un solo carro (por su ID).
     * Este es el método 'getHistoryByVehicle'.
     */
    public List<Maintenance> getHistoryByVehicle(Long vehicleId) {
        // Llama al método largo del repositorio que ordenamos por fecha
        return repository.findByVehicleIdOrderByDateDesc(vehicleId);
    }

    // ==========================================
    // MÉTODO 3: REPORTE TOTAL (All)
    // ==========================================
    /**
     * Trae TODOS los mantenimientos de la empresa (Reporte Global).
     * Este es el método 'getAllMaintenances'.
     */
    public List<Maintenance> getAllMaintenances() {
        // Usamos Sort para que salgan primero los más recientes (DESC = Descendente)
        return repository.findAll(Sort.by(Sort.Direction.DESC, "date"));
    }
}