package uce.edu.GestionFlota.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import uce.edu.GestionFlota.Model.Maintenance;

@Repository
public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    // Buscar el historial de un auto específico
    List<Maintenance> findByVehicleIdOrderByDateDesc(Long vehicleId);

    // Elimina el historial por ID de vehículo
    void deleteByVehicleId(Long vehicleId);
}