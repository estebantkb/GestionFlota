// src/layouts/UserLayout.js
import React, { useState } from 'react';
import { estilos, THEME } from '../config/theme';
import { calcularMetricas, API_BASE_URL, HEADERS_JSON } from '../config/utils';
import { StatusBadge, ProgressBar } from '../components/UI';
import { Search, LogOut, Gauge, Calendar, Activity, ClipboardList, Wrench, CheckCircle, AlertTriangle } from 'lucide-react';

const UserLayout = ({ vehiculos, notificar, onLogout, user }) => {
    const [search, setSearch] = useState("");
    const [result, setResult] = useState(null);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!search.trim()) {
            notificar("Ingrese una placa para buscar", "error");
            return;
        }
        const found = vehiculos.find(v => v.licensePlate === search || v.placa === search); // Support both formats just in case
        setResult(found);
        if (found) notificar("Información recuperada", "success");
        else notificar("Placa no encontrada en base de datos", "error");
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6f9' }}>
            <header style={{
                background: 'white',
                padding: '0 40px',
                height: '80px',
                color: THEME.text,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #E5E7EB'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: THEME.primary, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Search size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontWeight: '800', letterSpacing: '-0.5px', fontSize: '18px', lineHeight: '1.2' }}>CONSULTA PÚBLICA</div>
                        <div style={{ fontSize: '12px', color: THEME.textSoft }}>Sistema de Gestión de Flota</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: '800', color: THEME.text }}>{user?.nombre || 'Usuario'}</div>
                        <div style={{ fontSize: '12px', color: THEME.textSoft, fontWeight: '500' }}>{user?.role || 'Consulta'}</div>
                    </div>
                    <button
                        onClick={onLogout}
                        style={{
                            background: '#FEF2F2', // Soft light red tone
                            color: '#EF4444', // Red text
                            border: '1px solid #FECACA', // Soft red border
                            borderRadius: '12px',
                            padding: '10px 20px',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = '#FEE2E2';
                            e.currentTarget.style.borderColor = '#FCA5A5';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = '#FEF2F2';
                            e.currentTarget.style.borderColor = '#FECACA';
                        }}
                    >
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </header>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '0px', paddingBottom: '20px' }}>
                <div style={{ textAlign: 'center', marginBottom: '15px', maxWidth: '1000px', width: '100%' }}>
                    <p style={{ color: THEME.textSoft, fontSize: '15px', margin: '15px 0 0 0' }}>Ingrese el número de placa del vehículo para verificar sus condiciones operativas y próximo mantenimiento programado.</p>
                </div>

                <form
                    onSubmit={handleSearch}
                    style={{
                        display: 'flex',
                        gap: '10px',
                        marginBottom: '25px',
                        background: 'white',
                        padding: '8px',
                        borderRadius: '16px', // Less rounded
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)',
                        width: '100%',
                        maxWidth: '500px',
                        border: '1px solid #E5E7EB'
                    }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={20} color={THEME.textSoft} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="Ej: PBA-1234"
                            value={search}
                            onChange={e => {
                                // Validate and mask: AAA-1234
                                let val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                                if (val.length > 7) val = val.slice(0, 7); // Max 7 chars (3 letters + 4 nums) -> formatted to 8
                                if (val.length > 3) {
                                    val = val.slice(0, 3) + '-' + val.slice(3);
                                }
                                setSearch(val);
                            }}
                            maxLength={8}
                            style={{
                                ...estilos.input,
                                width: '100%',
                                fontSize: '16px',
                                border: 'none',
                                padding: '16px 20px 16px 50px',
                                background: 'transparent',
                                borderRadius: '12px' // Less rounded
                            }}
                        />
                    </div>
                    <button
                        type="submit"
                        style={{
                            ...estilos.btnPrimary,
                            borderRadius: '12px', // Less rounded
                            padding: '12px 32px',
                            fontSize: '15px',
                            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
                        }}>
                        Consultar
                    </button>
                </form>

                {result && <UserResultCard vehiculo={result} />}
            </div>
        </div>
    );
};

const UserResultCard = ({ vehiculo }) => {
    const m = calcularMetricas(vehiculo);
    const [stats, setStats] = useState({ total: 0, preventive: 0, corrective: 0 });

    React.useEffect(() => {
        if (!vehiculo.id) return;
        fetch(`${API_BASE_URL}/vehicles/${vehiculo.id}/history`, { headers: HEADERS_JSON })
            .then(res => res.json())
            .then(data => {
                setStats({
                    total: data.length,
                    preventive: data.filter(i => i.type === 'Preventivo').length,
                    corrective: data.filter(i => i.type === 'Correctivo').length
                });
            })
            .catch(err => console.error(err));
    }, [vehiculo.id]);

    return (
        <div className="fade-in" style={{
            background: 'white',
            padding: '0',
            borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
            width: '100%',
            maxWidth: '700px',
            borderTop: `8px solid ${m.color}`,
            overflow: 'hidden'
        }}>
            <div style={{ padding: '25px 30px', background: 'linear-gradient(to bottom, #fff, #f9fafb)', borderBottom: '1px solid #F3F4F6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                    <div>
                        <div style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: THEME.primary,
                            background: '#EEF2FF',
                            padding: '3px 8px',
                            borderRadius: '20px',
                            display: 'inline-block',
                            marginBottom: '8px'
                        }}>VEHÍCULO IDENTIFICADO</div>
                        <h2 style={{ margin: 0, color: THEME.text, fontSize: '36px', letterSpacing: '-2px', fontWeight: '800' }}>
                            {vehiculo.licensePlate || vehiculo.placa}
                        </h2>
                    </div>
                    <StatusBadge status={vehiculo.status || vehiculo.estado} />
                </div>
                <div style={{ fontSize: '18px', color: THEME.textSoft, fontWeight: '500' }}>
                    {vehiculo.brand || vehiculo.marca} {vehiculo.model || vehiculo.modelo} • {vehiculo.year || vehiculo.anio}
                </div>
                {(vehiculo.createdAt || vehiculo.registrationDate) && (
                    <div style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        background: '#F9FAFB',
                        borderRadius: '8px',
                        border: '1px solid #E5E7EB'
                    }}>
                        <div style={{
                            fontSize: '11px',
                            color: THEME.textSoft,
                            fontWeight: '700',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            marginBottom: '4px'
                        }}>
                            Fecha de Registro del Vehículo
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: THEME.text,
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}>
                            <Calendar size={16} color={THEME.primary} />
                            {new Date(vehiculo.createdAt || vehiculo.registrationDate).toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div style={{ padding: '25px 30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ padding: '10px', background: '#F3F4F6', borderRadius: '12px', height: 'fit-content' }}>
                        <Gauge size={24} color={THEME.text} />
                    </div>
                    <div>
                        <div style={{ textTransform: 'uppercase', fontSize: '11px', color: THEME.textSoft, fontWeight: '700', letterSpacing: '0.5px', marginBottom: '4px' }}>Lectura Actual</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: THEME.text }}>
                            {(vehiculo.mileage || vehiculo.kilometraje || 0).toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '500', color: THEME.textSoft }}>km</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div style={{ padding: '12px', background: '#F3F4F6', borderRadius: '12px', height: 'fit-content' }}>
                        <Activity size={24} color={THEME.text} />
                    </div>
                    <div>
                        <div style={{ textTransform: 'uppercase', fontSize: '11px', color: THEME.textSoft, fontWeight: '700', letterSpacing: '0.5px', marginBottom: '4px' }}>Próximo Servicio</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: THEME.text }}>
                            {m.proximoMant.toLocaleString()} <span style={{ fontSize: '14px', fontWeight: '500', color: THEME.textSoft }}>km</span>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 30px 25px 30px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div style={{ background: '#F8FAFC', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #E2E8F0' }}>
                    <div style={{ padding: '6px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <ClipboardList size={22} color="#64748B" />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#64748B' }}>Total Mantenimientos</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#334155' }}>{stats.total}</div>
                    </div>
                </div>
                <div style={{ background: '#F0FDF4', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #DCFCE7' }}>
                    <div style={{ padding: '6px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <CheckCircle size={22} color="#16A34A" />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#166534' }}>Preventivos</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#15803D' }}>{stats.preventive}</div>
                    </div>
                </div>
                <div style={{ background: '#FFF7ED', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #FFEDD5' }}>
                    <div style={{ padding: '6px', background: 'white', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <AlertTriangle size={22} color="#EA580C" />
                    </div>
                    <div>
                        <div style={{ fontSize: '11px', textTransform: 'uppercase', fontWeight: '700', color: '#EA580C' }}>Correctivos</div>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#EA580C' }}>{stats.corrective}</div>
                    </div>
                </div>
            </div>

            <div style={{ padding: '0 30px 30px 30px' }}>
                <div style={{ background: '#F9FAFB', padding: '20px', borderRadius: '16px', border: '1px solid #F3F4F6' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Activity size={16} color={THEME.textSoft} />
                            <span style={{ fontSize: '13px', fontWeight: '700', color: THEME.textSoft, textTransform: 'uppercase' }}>PROGRESO DEL CICLO</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: '800',
                                color: m.color === '#27ae60' ? '#16A34A' : m.color === '#c0392b' ? '#DC2626' : '#F97316',
                                textTransform: 'uppercase',
                                marginBottom: '2px'
                            }}>
                                {m.color === '#27ae60' ? 'Mantenimiento en Regla' : m.color === '#c0392b' ? 'Mantenimiento Vencido' : 'Mantenimiento Próximo'}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: m.color, background: 'white', padding: '4px 10px', borderRadius: '6px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)', display: 'inline-block' }}>
                                {m.restante > 0
                                    ? `${m.restante.toLocaleString()} km restantes`
                                    : `${Math.abs(m.restante).toLocaleString()} km en exceso`
                                }
                            </span>
                        </div>
                    </div>
                    <ProgressBar porcentaje={m.porcentajeUso} color={m.color} height="12px" />
                </div>
            </div>
        </div>
    );
};

export default UserLayout;
