/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package uce.edu.GestionFlota.Service;

/**
 *
 * @author USER
 */

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import uce.edu.GestionFlota.Model.User;
import uce.edu.GestionFlota.Repository.UserRepository;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public User validateCredentials(String username, String password) {
        return userRepository.findByUsernameAndPassword(username, password);
    }
}
