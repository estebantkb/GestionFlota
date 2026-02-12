import { THEME } from './theme';

// ==========================================
// 1. CONFIGURACIÓN DE API
// ==========================================

export const getApiUrl = () => {
    // Si usas Ngrok/Localtunnel, pon tu URL aquí.
    // Si estás en local, usa localhost:8080
    return 'http://localhost:8080/api';
};

export const API_BASE_URL = getApiUrl();

export const HEADERS_JSON = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true'
};

// ==========================================
// 2. LÓGICA DE NEGOCIO (MÉTRICAS)
// ==========================================

export const calcularMetricas = (v) => {
    // CHANGE: Variables en Inglés
    const actual = v.mileage || 0;                    // Antes: kilometraje
    const ultimo = v.lastMaintenanceKm || 0;          // Antes: ultimo_mantenimiento_km
    const intervalo = v.maintenanceIntervalKm || 5000;// Antes: intervalo_mantenimiento_km

    // Cálculos matemáticos (igual que antes)
    const proximo = ultimo + intervalo;
    const restante = proximo - actual;
    const recorrido = actual - ultimo;

    let porcentajeUso = (recorrido / intervalo) * 100;
    if (porcentajeUso > 100) porcentajeUso = 100;
    if (porcentajeUso < 0) porcentajeUso = 0;

    // Lógica del Semáforo
    let estadoMant = 'VERDE';
    let color = THEME.success;

    if (porcentajeUso >= 100 || restante <= 0) {
        estadoMant = 'ROJO';
        color = THEME.danger;
    } else if (porcentajeUso >= 70) {
        estadoMant = 'AMARILLO';
        color = THEME.warning;
    }

    return { restante, proximoMant: proximo, estadoMant, color, porcentajeUso };
};