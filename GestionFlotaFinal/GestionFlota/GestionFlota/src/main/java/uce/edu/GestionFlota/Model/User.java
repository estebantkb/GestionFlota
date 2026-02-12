package uce.edu.GestionFlota.Model;

import jakarta.persistence.*;

/**
 * Clase Entidad para Usuarios.
 * Representa la tabla de seguridad y acceso en la Base de Datos.
 */
@Entity // Le dice a Java: "Esta clase se convertirá en una tabla SQL".
@Table(name = "users") // Le dice a la BD: "La tabla se llamará 'users'".
public class User {
    
    // --- CLAVE PRIMARIA (PRIMARY KEY) ---
    @Id // Indica que este campo es la Llave Primaria (ID único).
    @GeneratedValue(strategy = GenerationType.IDENTITY) // "Auto Increment": La BD asigna el número (1, 2, 3...) automáticamente.
    private Long id; // Usamos 'Long' (no int) porque es el estándar para IDs grandes en bases de datos.
    
    // --- COLUMNAS DE DATOS ---
    
    // @Column(unique = true): Regla de seguridad que impide que existan dos usuarios con el mismo nombre.
    // nullable = false: Obliga a que el campo nunca esté vacío.
    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    // Este campo define si es "ADMIN", "CHOFER", "MECANICO".
    // Lo necesitamos para que el AuthController sepa qué permisos dar.
    private String role; 

    // --- CONSTRUCTORES ---
    
    // 1. Constructor Vacío: OBLIGATORIO para que JPA/Hibernate pueda leer la base de datos sin errores.
    public User() {
    }

    // 2. Constructor Lleno: Útil para crear usuarios manualmente desde el código si hace falta.
    public User(String username, String password, String role) {
        this.username = username;
        this.password = password;
        this.role = role;
    }

    // --- GETTERS Y SETTERS ---
    // Son los "puentes" para que otras clases (como el Controller) puedan leer o escribir datos aquí.

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
    
    // --- MÉTODO TOSTRING ---
    // Sirve para que cuando imprimas "System.out.println(usuario)" en consola,
    // veas los datos en texto y no un código raro de memoria.
    @Override
    public String toString() {
        return "User{" + "id=" + id + ", username=" + username + ", role=" + role + '}';
    }
}