import React, { useState, useEffect } from 'react';
import { estilos, THEME } from '../config/theme';
import { API_BASE_URL, HEADERS_JSON, calcularMetricas } from '../config/utils';
import { ProgressBar, StatusBadge } from '../components/UI';
import { Truck, Activity, RotateCw, CheckCircle, Settings, Edit, Trash2, AlertTriangle, X, Search } from 'lucide-react';

const DeleteConfirmationModal = ({ vehicle, onConfirm, onCancel }) => {
    const [count, setCount] = useState(null);

    useEffect(() => {
        if (vehicle) {
            fetch(`${API_BASE_URL}/vehicles/${vehicle.id}/history`, { headers: HEADERS_JSON })
                .then(res => res.ok ? res.json() : [])
                .then(data => setCount(Array.isArray(data) ? data.length : 0))
                .catch(() => setCount(0));
        }
    }, [vehicle]);

    if (!vehicle) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 3000, backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                background: 'white', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '480px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                textAlign: 'center', animation: 'fadeIn 0.2s ease-out'
            }}>
                <div style={{
                    width: '80px', height: '80px', background: '#FEF2F2', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto'
                }}>
                    <AlertTriangle size={40} color="#DC2626" strokeWidth={1.5} />
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', marginBottom: '24px', fontFamily: "'Poppins', sans-serif" }}>
                    ¡Atención Requerida!
                </h2>

                <div style={{ background: '#FFF5F5', border: '1px solid #FEF2F2', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
                    <p style={{ color: '#4B5563', fontSize: '15px', marginBottom: '12px' }}>
                        El vehículo <span style={{ fontWeight: '600', textTransform: 'uppercase', color: '#374151' }}>{vehicle.brand}</span>, modelo <span style={{ fontWeight: '600', textTransform: 'uppercase', color: '#374151' }}>{vehicle.model}</span> con placa <strong style={{ fontWeight: '800', color: '#1e40af', fontSize: '15px', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif" }}>{vehicle.licensePlate}</strong> tiene
                    </p>
                    <div style={{
                        background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '30px',
                        padding: '8px 20px', display: 'inline-block', marginBottom: '16px',
                        color: '#B91C1C', fontWeight: '700', fontSize: '14px'
                    }}>
                        {count !== null ? count : '...'} mantenimientos registrados
                    </div>
                    <p style={{ color: '#6B7280', fontSize: '14px' }}>
                        Al eliminarlo, <strong style={{ color: '#7F1D1D' }}>se perderá todo su historial</strong> permanentemente.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                    <button onClick={onCancel} style={{
                        flex: 1, padding: '14px', border: '1px solid #E5E7EB', borderRadius: '12px',
                        background: 'white', color: '#374151', fontWeight: '700', cursor: 'pointer',
                        fontSize: '15px', transition: 'all 0.2s'
                    }}>
                        Cancelar
                    </button>
                    <button onClick={onConfirm} style={{
                        flex: 1, padding: '14px', border: 'none', borderRadius: '12px',
                        background: '#DC2626', color: 'white', fontWeight: '700', cursor: 'pointer',
                        fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                        boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)'
                    }}>
                        <Trash2 size={18} />
                        Eliminar Todo
                    </button>
                </div>
            </div>
        </div>
    );
};

const InventoryView = ({ vehiculos, recargar, notificar, onEdit, onConfig }) => {
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Filtrado inteligente
    const filteredVehicles = vehiculos.filter(v => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return v.licensePlate.toLowerCase().includes(term) ||
            v.brand.toLowerCase().includes(term) ||
            v.model.toLowerCase().includes(term);
    });

    const suggestions = searchTerm.length > 0 ? filteredVehicles : [];

    // Helper para encabezados con iconos
    const ThWithIcon = ({ icon: Icon, label, width }) => (
        <th style={{ ...estilos.th, verticalAlign: 'middle', width: width }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6B7280' }}>
                {Icon && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(107, 114, 128, 0.1)', padding: '6px', borderRadius: '8px'
                    }}>
                        <Icon size={16} strokeWidth={2} style={{ opacity: 0.7 }} />
                    </div>
                )}
                <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
        </th>
    );

    const confirmarEliminacion = () => {
        if (!deleteTarget) return;

        // CHANGE: URL /vehicles
        fetch(`${API_BASE_URL}/vehicles/${deleteTarget.id}`, {
            method: 'DELETE',
            headers: HEADERS_JSON
        })
            .then(res => {
                if (res.ok) {
                    notificar("Eliminado correctamente", "info");
                    recargar();
                    setDeleteTarget(null);
                } else {
                    throw new Error("Error en el servidor");
                }
            })
            .catch(err => {
                console.error("Error eliminando:", err);
                notificar("Error al eliminar: " + err.message, "error");
                setDeleteTarget(null);
            });
    };

    return (
        <div>
            {/* --- SEARCH BAR --- */}
            <div style={{ marginBottom: '25px', position: 'relative', maxWidth: '600px' }}>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#374151', marginBottom: '8px' }}>Buscar Unidad:</label>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }}>
                        <Search size={20} />
                    </div>
                    <input
                        type="text"
                        placeholder="Placa, Marca o Modelo..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setShowSuggestions(true);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        // Delay blur to allow click on suggestion
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 48px',
                            borderRadius: '12px',
                            border: '1px solid #E5E7EB',
                            fontSize: '15px',
                            background: '#F9FAFB',
                            outline: 'none',
                            transition: 'all 0.2s'
                        }}
                    />
                </div>

                {/* --- SUGGESTIONS DROPDOWN --- */}
                {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        background: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                        zIndex: 50,
                        marginTop: '8px',
                        padding: '8px',
                        border: '1px solid #F3F4F6'
                    }}>
                        {suggestions.slice(0, 5).map(v => {
                            const stats = calcularMetricas(v);
                            return (
                                <div
                                    key={v.id}
                                    onClick={() => {
                                        setSearchTerm(v.licensePlate); // Update input
                                        setShowSuggestions(false); // Hide dropdown
                                    }}
                                    style={{
                                        padding: '10px 16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        cursor: 'pointer',
                                        borderRadius: '8px',
                                        borderLeft: `4px solid ${stats.color}`,
                                        marginBottom: '4px',
                                        background: 'white',
                                        transition: 'background 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                                >
                                    <div style={{
                                        width: '8px', height: '8px', borderRadius: '50%',
                                        background: stats.color
                                    }}></div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', fontSize: '14px', color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                                            {v.licensePlate}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#6B7280' }}>
                                            {v.brand} {v.model} • {v.year}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <div style={{ ...estilos.tableCard, overflowX: 'visible', overflowY: 'visible', minHeight: '600px' }}>
                {deleteTarget && (
                    <DeleteConfirmationModal
                        vehicle={deleteTarget}
                        onConfirm={confirmarEliminacion}
                        onCancel={() => setDeleteTarget(null)}
                    />
                )}
                <table style={{ ...estilos.table, tableLayout: 'fixed', width: '100%', minWidth: '800px' }}>
                    <thead>
                        <tr>
                            <ThWithIcon icon={Truck} label="UNIDAD" width="16%" />
                            <ThWithIcon icon={Activity} label="KILOMETRAJE" width="18%" />
                            <ThWithIcon icon={RotateCw} label="CICLO DE MANTENIMIENTO" width="26%" />
                            <ThWithIcon icon={CheckCircle} label="ESTADO OPERATIVO" width="18%" />
                            <ThWithIcon icon={null} label="ADMINISTRACIÓN" width="22%" />
                        </tr>
                    </thead>
                    <tbody>
                        {filteredVehicles.map(v => {
                            const m = calcularMetricas(v);
                            return (
                                <tr key={v.id} style={estilos.tr}>
                                    <td style={estilos.td}>
                                        {/* CHANGE: licensePlate - Poppins font, darker blue */}
                                        <div style={{ fontWeight: '800', color: '#1e40af', fontSize: '15px', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif", whiteSpace: 'nowrap' }}>{v.licensePlate}</div>
                                        {/* CHANGE: brand, model */}
                                        <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', marginTop: '4px' }}>{v.brand} {v.model}</div>
                                    </td>
                                    {/* CHANGE: mileage - Force comma regex */}
                                    <td style={estilos.td}>{v.mileage?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km</td>
                                    <td style={estilos.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                                            <div style={{ width: '80px' }}>
                                                <ProgressBar porcentaje={m.porcentajeUso} color={m.color} />
                                            </div>
                                            <span style={{ color: m.color, fontWeight: 'bold', fontSize: '11px' }}>
                                                {m.restante > 0 ? `${m.restante} km restantes` : `VENCIDO`}
                                            </span>
                                        </div>
                                    </td>
                                    <td style={estilos.td}>
                                        {/* CHANGE: status */}
                                        <StatusBadge status={v.status} />
                                    </td>
                                    <td style={estilos.td}>
                                        <div style={{ display: 'flex', gap: '12px' }}>
                                            <button onClick={() => onEdit(v)} title="Editar" style={{
                                                background: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: '8px',
                                                padding: '8px', cursor: 'pointer', color: '#3B82F6', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Edit size={16} />
                                            </button>
                                            <button onClick={() => onConfig(v)} title="Reglas" style={{
                                                background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: '8px',
                                                padding: '8px', cursor: 'pointer', color: '#4B5563', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Settings size={16} />
                                            </button>
                                            <button onClick={() => setDeleteTarget(v)} title="Borrar" style={{
                                                background: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: '8px',
                                                padding: '8px', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default InventoryView;