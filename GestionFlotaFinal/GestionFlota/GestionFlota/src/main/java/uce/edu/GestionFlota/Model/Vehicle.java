
package uce.edu.GestionFlota.Model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
// import javax.persistence.*; // Usa esto solo si tu Spring Boot es muy antiguo (versión < 3.0)

/**
 * Clase Entidad para los Vehículos.
 * Esta clase mapea la tabla 'vehicles' de la base de datos para manejar la
 * flota.
 */
@Entity // Indica a Spring/Hibernate que esta clase representa una tabla real.
@Table(name = "vehicles") // Definimos el nombre de la tabla en Plural e Inglés (Estándar SQL).
public class Vehicle {

    // --- IDENTIFICADOR ÚNICO (PRIMARY KEY) ---
    @Id // Marca este campo como la Llave Primaria.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // AUTO_INCREMENT: La base de datos asigna el ID (1, 2, 3...).
    private Long id; // Usamos 'Long' para soportar millones de registros.

    // --- DATOS PRINCIPALES DEL VEHÍCULO ---

    // @Column(name = "..."): Sirve para traducir.
    // En Java usamos CamelCase (licensePlate), pero en SQL se usa snake_case
    // (license_plate).
    // unique = true: Impide que registres dos carros con la misma placa.
    // nullable = false: Obliga a que este campo nunca esté vacío.
    @Column(name = "license_plate", unique = true, nullable = false)
    private String licensePlate; // Placa

    @Column(nullable = false)
    private String brand; // Marca (Ej: Chevrolet, Toyota)

    private String model; // Modelo (Ej: D-Max, Hilux)

    // Usamos 'Integer' (Clase Wrapper) en vez de 'int' primitivo.
    // ¿Por qué? Porque 'Integer' permite valores NULL si no sabemos el año todavía.
    @Column(name = "production_year")
    private Integer year; // Año de fabricación

    private Double mileage; // Kilometraje actual

    private String status; // Estado operativo (Ej: 'Available', 'Maintenance')

    // --- CONFIGURACIÓN DE MANTENIMIENTO (Lógica de Negocio) ---

    // Mapeo: Base de datos (last_maintenance_km) <---> Java (lastMaintenanceKm)
    @Column(name = "last_maintenance_km")
    private Double lastMaintenanceKm; // Kilometraje del último mantenimiento realizado

    // Frecuencia de mantenimiento (Ej: Cada 5000 km)
    @Column(name = "maintenance_interval_km")
    private Integer maintenanceIntervalKm;

    // --- FECHA DE REGISTRO ---

    // Fecha y hora en que se registró el vehículo en el sistema
    // @CreationTimestamp: Hibernate llena este campo automáticamente al crear el
    // registro
    // updatable = false: Impide que se modifique después de creado
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // --- CONSTRUCTORES ---

    /**
     * Constructor Vacío (Obligatorio para JPA).
     * Aquí inicializamos valores por defecto para evitar errores matemáticos
     * (NullPointerException).
     */
    public Vehicle() {
        this.lastMaintenanceKm = 0.0; // Empieza en 0 si no se especifica.
        this.maintenanceIntervalKm = 5000; // Por defecto, mantenimiento cada 5000 km.
        this.status = "Available"; // Por defecto, el carro está listo para usar.
    }

    /**
     * Constructor con Parámetros.
     * Útil para crear vehículos rápidamente desde el código de prueba o carga
     * inicial.
     */
    public Vehicle(String licensePlate, String brand, String model, Integer year, Double mileage, String status) {
        this(); // Llama al constructor vacío primero para cargar los valores por defecto.
        this.licensePlate = licensePlate;
        this.brand = brand;
        this.model = model;
        this.year = year;
        this.mileage = mileage;
        this.status = status;
    }

    // --- GETTERS Y SETTERS ---
    // Métodos públicos para leer (Get) y modificar (Set) los datos privados.

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLicensePlate() {
        return licensePlate;
    }

    public void setLicensePlate(String licensePlate) {
        this.licensePlate = licensePlate;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Double getMileage() {
        return mileage;
    }

    public void setMileage(Double mileage) {
        this.mileage = mileage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getLastMaintenanceKm() {
        return lastMaintenanceKm;
    }

    public void setLastMaintenanceKm(Double lastMaintenanceKm) {
        this.lastMaintenanceKm = lastMaintenanceKm;
    }

    public Integer getMaintenanceIntervalKm() {
        return maintenanceIntervalKm;
    }

    public void setMaintenanceIntervalKm(Integer maintenanceIntervalKm) {
        this.maintenanceIntervalKm = maintenanceIntervalKm;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // --- MÉTODO TOSTRING ---
    // Permite ver la información del objeto en texto plano al imprimir en consola.
    // Muy útil para depuración (Debugging).
    @Override
    public String toString() {
        return "Vehicle{" + "id=" + id + ", plate=" + licensePlate + ", brand=" + brand + ", status=" + status + '}';
    }
}