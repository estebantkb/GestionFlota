
package uce.edu.GestionFlota.Model;

import jakarta.persistence.*;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDate;

/**
 * Clase Entidad para el Historial de Mantenimientos.
 * Registra cada vez que un vehículo entra al taller, qué se le hizo y cuánto
 * costó.
 */
@Entity // Indica que esto es una tabla en la Base de Datos.
@Table(name = "maintenances") // Nombre de la tabla en Plural e Inglés.
public class Maintenance {

    // --- IDENTIFICADOR ---
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- DATOS DEL MANTENIMIENTO ---

    // Usamos LocalDate porque solo nos interesa el día (año-mes-día), no la hora
    // exacta.
    private LocalDate date; // Antes: fecha

    private String type; // Antes: tipo (Ej: "Preventivo", "Correctivo", "Cambio de Aceite")

    private Double cost; // Antes: costo (Double permite decimales para centavos)

    private String description; // Antes: descripcion (Detalles técnicos de lo que se hizo)

    // Guardamos el kilometraje que tenía el carro EN ESE MOMENTO.
    // Esto es vital para saber a los cuántos km se hizo el arreglo.
    @Column(name = "mileage_at_maintenance")
    private Double mileageAtMaintenance; // Antes: kilometrajeAlMomento

    // --- RELACIÓN CON VEHÍCULO (La parte más importante) ---

    // @ManyToOne: "Muchos mantenimientos pertenecen a Un solo vehículo".
    // Esta es la Llave Foránea (Foreign Key) en la base de datos.
    @ManyToOne
    @JoinColumn(name = "vehicle_id") // Nombre de la columna en la tabla SQL que conecta con Vehicle.

    // @JsonIgnoreProperties: TRUCO DE EXPERTO.
    // Evita el "Bucle Infinito" al convertir a JSON.
    // Si no pones esto, Java intentará traer el Vehículo, y el Vehículo traerá sus
    // Mantenimientos,
    // y esos Mantenimientos traerán al Vehículo... hasta que explota la memoria.
    @JsonIgnoreProperties("maintenances")
    private Vehicle vehicle; // Antes: vehiculo

    // --- CONSTRUCTORES ---

    public Maintenance() {
        // Por defecto, si no le pones fecha, asume que el mantenimiento es HOY.
        this.date = LocalDate.now();
    }

    // --- GETTERS Y SETTERS ---
    // (Traducidos al Inglés para coincidir con las variables)

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getMileageAtMaintenance() {
        return mileageAtMaintenance;
    }

    public void setMileageAtMaintenance(Double mileageAtMaintenance) {
        this.mileageAtMaintenance = mileageAtMaintenance;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
    }

    // toString para depuración
    @Override
    public String toString() {
        return "Maintenance{" + "id=" + id + ", date=" + date + ", type=" + type + ", cost=" + cost + '}';
    }
}