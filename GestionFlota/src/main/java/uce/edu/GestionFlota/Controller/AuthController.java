
package uce.edu.GestionFlota.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import uce.edu.GestionFlota.Model.User;
import uce.edu.GestionFlota.Service.UserService;

import java.util.HashMap;
import java.util.Map;

/**
 * Controlador de Autenticación (AuthController).
 * * Esta clase funciona como la "puerta de entrada" para el Login.
 * Se encarga de recibir las credenciales desde el Frontend (React),
 * procesarlas y devolver si el usuario tiene permiso para entrar.
 * * @author USER
 */
@RestController // Define que esta clase es un controlador REST que responde con datos JSON (no
                // HTML).
@RequestMapping("/api/auth") // Prefijo para las rutas. URL final: http://localhost:8080/api/auth/...
@CrossOrigin(origins = "*") // IMPORTANTE: Habilita CORS para permitir que React (puerto 3000) consuma esta
                            // API sin bloqueos de seguridad.
public class AuthController {

    // Inyección de Dependencias:
    // Traemos el UserService para delegarle la lógica de negocio y validación.
    // No accedemos al repositorio ni a la base de datos directamente desde el
    // controlador.
    @Autowired
    private UserService userService;

    /**
     * Endpoint para iniciar sesión (Login).
     * * Método: POST
     * Ruta: /api/auth/login
     * * @param user Objeto User construido automáticamente desde el JSON que envía
     * React.
     * 
     * @return Un mapa (JSON) con el estado (ok/error), mensaje y el rol del
     *         usuario.
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody User user) {

        // 1. Llamamos al servicio para buscar si existe un usuario con ese username y
        // password.
        User foundUser = userService.validateCredentials(user.getUsername(), user.getPassword());

        // 2. Preparamos la respuesta. Usamos un Map porque Spring lo convierte
        // automáticamente a JSON.
        Map<String, Object> response = new HashMap<>();

        if (foundUser != null) {
            // CASO ÉXITO: Las credenciales son correctas.
            response.put("status", "ok"); // Bandera para que React sepa que puede redirigir.
            response.put("message", "Bienvenido al sistema, " + foundUser.getUsername());

            // CRÍTICO: Enviamos el ROL ('ADMIN' o 'USER') al frontend.
            // React usará este dato para decidir si muestra los botones de editar/borrar.
            response.put("role", foundUser.getRole());
        } else {
            // CASO ERROR: Usuario no encontrado o contraseña incorrecta.
            response.put("status", "error");
            response.put("message", "Credenciales inválidas. Intente nuevamente.");
        }

        // Retornamos el JSON final al navegador.
        return response;
    }
}