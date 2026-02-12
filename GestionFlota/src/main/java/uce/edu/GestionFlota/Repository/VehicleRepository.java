package uce.edu.GestionFlota.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional; 
import uce.edu.GestionFlota.Model.Vehicle;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    
    
    // Debe devolver Optional<Vehiculo> para que el .map() del controlador funcione.
    Optional<Vehicle> findByLicensePlate(String licensePlate);
}