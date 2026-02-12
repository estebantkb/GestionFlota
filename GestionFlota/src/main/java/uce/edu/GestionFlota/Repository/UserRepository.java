package uce.edu.GestionFlota.Repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import uce.edu.GestionFlota.Model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    // Método: Spring crea el SQL automático con solo leer el nombre del método
    User findByUsernameAndPassword(String username, String password);
}