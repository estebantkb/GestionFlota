import React, { useState, useEffect } from 'react';
import { API_BASE_URL, HEADERS_JSON } from '../config/utils';
import AdminLayout from './AdminLayout';
import UserLayout from './UserLayout';

const SistemaFlota = ({ user, onLogout, notificar }) => {
  const [vehiculos, setVehiculos] = useState([]);
  
  const cargarVehiculos = () => {
    // CHANGE: URL cambio de /vehiculos a /vehicles
    fetch(`${API_BASE_URL}/vehicles`, { headers: HEADERS_JSON })
      .then(response => response.json())
      .then(data => setVehiculos(data))
      .catch(error => console.error("Error cargando flota:", error));
  };

  useEffect(() => { cargarVehiculos(); }, []);

  // CHANGE: 'rol' ahora es 'role' en el Backend
  if (user.role === 'ADMIN') {
    return <AdminLayout vehiculos={vehiculos} recargar={cargarVehiculos} notificar={notificar} user={user} onLogout={onLogout} />;
  }

  return <UserLayout vehiculos={vehiculos} notificar={notificar} user={user} onLogout={onLogout} />;
};

export default SistemaFlota;