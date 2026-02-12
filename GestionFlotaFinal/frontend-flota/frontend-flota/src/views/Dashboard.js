import React from 'react';
import { THEME } from '../config/theme';
import { calcularMetricas, API_BASE_URL } from '../config/utils';
import { MetricCard } from '../components/UI';
import DashboardCharts from '../components/DashboardCharts';
import { Car, CheckCircle, AlertTriangle, Wrench } from 'lucide-react';

const DashboardView = ({ vehiculos }) => {
    const [maintenances, setMaintenances] = React.useState([]);

    React.useEffect(() => {
        // Fetch separa el historial de mantenimientos
        fetch(`${API_BASE_URL}/vehicles/maintenances/all`)
            .then(res => res.json())
            .then(data => setMaintenances(data))
            .catch(err => console.error("Error fetching history:", err));
    }, []);

    const total = vehiculos.length;
    // CHANGE: Java usa "Available"
    const activos = vehiculos.filter(v => v.status === 'Available' || v.status === 'Activo').length;
    // CHANGE: Cualquier cosa que no sea Available
    const inactivos = vehiculos.filter(v => v.status !== 'Available' && v.status !== 'Activo').length;
    const criticos = vehiculos.filter(v => calcularMetricas(v).estadoMant === 'ROJO').length;

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '25px' }}>
                <MetricCard title="Flota Total" value={total} color={THEME.primary} icon={Car} />
                <MetricCard title="ACTIVO" value={activos} color={THEME.success} icon={CheckCircle} />
                <MetricCard title="INACTIVO" value={inactivos} color="#ef4444" icon={Wrench} />
            </div>

            <DashboardCharts vehiculos={vehiculos} maintenances={maintenances} />
        </div>
    );
};

export default DashboardView;