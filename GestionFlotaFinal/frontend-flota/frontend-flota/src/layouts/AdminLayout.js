// src/layouts/AdminLayout.js
import React, { useState } from 'react';
import { estilos, THEME } from '../config/theme';
import { calcularMetricas } from '../config/utils';
import { MenuButton, AlertCard } from '../components/UI';
import ModalManager from '../components/ModalManager';
import { LayoutDashboard, Package, FileText, PlusCircle, User, LogOut, Bell, X, BellRing, Truck } from 'lucide-react';

// Importamos las Vistas
import DashboardView from '../views/Dashboard';
import InventoryView from '../views/Inventory';
import ReportsView from '../views/Reports';
import RegisterView from '../views/Register';

const AdminLayout = ({ vehiculos, recargar, notificar, user, onLogout }) => {
    const [view, setView] = useState('dashboard');
    const [showAlerts, setShowAlerts] = useState(true);
    const [vehiculoSelect, setVehiculoSelect] = useState(null);
    const [modalMode, setModalMode] = useState(null);

    const alertasActivas = vehiculos
        .map(v => ({ ...v, ...calcularMetricas(v) }))
        .filter(v => v.estadoMant === 'ROJO' || v.estadoMant === 'AMARILLO')
        .sort((a, b) => a.restante - b.restante);

    const abrirEdicion = (v) => {
        setVehiculoSelect({ ...v });
        setModalMode('edit');
    };

    return (
        <div style={estilos.adminGrid}>
            <aside style={estilos.sidebar}>
                <div style={{
                    ...estilos.logoArea,
                    background: 'rgba(0,0,0,0.1)',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    color: '#fff'
                }}>
                    <div style={{ width: '32px', height: '32px', background: THEME.accent, borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Truck size={20} color="white" />
                    </div>
                    <span>GESTIÓN FLOTA</span>
                </div>
                <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <MenuButton
                        label="Panel General"
                        active={view === 'dashboard'}
                        onClick={() => setView('dashboard')}
                        icon={LayoutDashboard}
                    />
                    <MenuButton
                        label="Inventario"
                        active={view === 'inventory'}
                        onClick={() => setView('inventory')}
                        icon={Package}
                    />
                    <MenuButton
                        label="Reportes & Costos"
                        active={view === 'reports'}
                        onClick={() => setView('reports')}
                        icon={FileText}
                    />
                    <MenuButton
                        label="Nuevo Registro"
                        active={view === 'register'}
                        onClick={() => setView('register')}
                        icon={PlusCircle}
                    />
                </nav>
                <div style={estilos.userProfile}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                        <div style={{ background: '#374151', padding: '8px', borderRadius: '50%' }}>
                            <User size={20} color="#9CA3AF" />
                        </div>
                        <div>
                            <div style={{ fontWeight: '600', color: 'white', fontSize: '14px' }}>{user.nombre}</div>
                            <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Administrador</div>
                        </div>
                    </div>
                    <button
                        onClick={onLogout}
                        style={{
                            marginTop: '16px',
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: '#F87171',
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            fontSize: '13px',
                            fontWeight: '500',
                            transition: 'all 0.2s'
                        }}
                    >
                        <LogOut size={16} /> Cerrar Sesión
                    </button>
                </div>
            </aside>

            <main style={estilos.mainContent}>
                <header style={estilos.topBar}>
                    <div>
                        <h2 style={{ ...estilos.pageTitle, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {view === 'dashboard' && <><LayoutDashboard size={24} color={THEME.textSoft} /> Visión General</>}
                            {view === 'inventory' && <><Package size={24} color={THEME.textSoft} /> Inventario de Unidades</>}
                            {view === 'reports' && <><FileText size={24} color={THEME.textSoft} /> Reportes Financieros</>}
                            {view === 'register' && <><PlusCircle size={24} color={THEME.textSoft} /> Registro Vehicular</>}
                        </h2>
                        <span style={{ fontSize: '13px', color: THEME.textSoft }}>
                            {view === 'register' ? 'Bienvenido al panel de registro vehicular' :
                                view === 'reports' ? 'Bienvenido al panel de reportes financieros' :
                                    view === 'inventory' ? 'Bienvenido al panel de inventario' :
                                        'Bienvenido al panel de administración'}
                        </span>
                    </div>
                    <button
                        onClick={() => setShowAlerts(!showAlerts)}
                        style={{
                            ...estilos.btnGhost,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: showAlerts ? '#EEF2FF' : 'transparent',
                            color: showAlerts ? THEME.primary : THEME.textSoft,
                            border: showAlerts ? `1px solid ${THEME.primary}30` : '1px solid #E5E7EB'
                        }}
                    >
                        <Bell size={18} />
                        {showAlerts ? 'Ocultar Alertas' : `Ver Alertas`}

                        {/* Badges de Conteo */}
                        <div style={{ display: 'flex', gap: '8px', marginLeft: '6px' }}>
                            {alertasActivas.filter(v => v.estadoMant === 'ROJO').length > 0 && (
                                <span style={{ background: THEME.danger, color: 'white', fontSize: '13px', height: '21px', minWidth: '21px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', padding: '0' }}>
                                    {alertasActivas.filter(v => v.estadoMant === 'ROJO').length}
                                </span>
                            )}
                            {alertasActivas.filter(v => v.estadoMant === 'AMARILLO').length > 0 && (
                                <span style={{ background: THEME.warning, color: 'white', fontSize: '13px', height: '21px', minWidth: '21px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', padding: '0' }}>
                                    {alertasActivas.filter(v => v.estadoMant === 'AMARILLO').length}
                                </span>
                            )}
                        </div>
                    </button>
                </header>

                <div style={estilos.contentBody}>
                    {view === 'dashboard' && <DashboardView vehiculos={vehiculos} />}

                    {view === 'inventory' && (
                        <InventoryView
                            vehiculos={vehiculos}
                            onEdit={abrirEdicion}
                            recargar={recargar}
                            notificar={notificar}
                            onConfig={(v) => { setVehiculoSelect({ ...v }); setModalMode('config'); }}
                        />
                    )}

                    {view === 'reports' && <ReportsView />}

                    {view === 'register' && <RegisterView recargar={recargar} notificar={notificar} />}
                </div>
            </main>

            <aside style={{ ...estilos.rightPanel, width: showAlerts ? '320px' : '0px', borderLeft: showAlerts ? '1px solid #e0e0e0' : 'none' }}>
                <div style={{ ...estilos.rightHeader, justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BellRing size={28} color="#f59e0b" style={{ filter: 'drop-shadow(0 2px 4px rgba(245, 158, 11, 0.2))' }} />
                        <span style={{ fontWeight: '800', letterSpacing: '0.5px', fontSize: '16px', color: '#374151' }}>CENTRO DE ALERTAS</span>
                    </div>
                </div>
                <div style={{ overflowY: 'auto', height: 'calc(100vh - 70px)', padding: '24px', background: '#F9FAFB' }}>
                    {alertasActivas.length === 0 ? (
                        <div style={{ ...estilos.emptyState, background: 'white', borderRadius: '12px', border: '1px dashed #E5E7EB', padding: '30px 20px' }}>
                            <div style={{ background: '#ECFDF5', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' }}>
                                <Bell size={24} color={THEME.success} />
                            </div>
                            <p style={{ fontWeight: '600', color: THEME.text, marginBottom: '4px' }}>Todo en orden</p>
                            <span style={{ fontSize: '13px', color: THEME.textSoft }}>No hay mantenimientos pendientes por ahora.</span>
                        </div>
                    ) : (
                        alertasActivas.map(v => (
                            <AlertCard key={v.id} vehiculo={v} onClick={() => abrirEdicion(v)} />
                        ))
                    )}
                </div>
            </aside>

            {modalMode && vehiculoSelect && (
                <ModalManager
                    mode={modalMode}
                    vehiculo={vehiculoSelect}
                    setVehiculo={setVehiculoSelect}
                    onClose={() => setModalMode(null)}
                    recargar={recargar}
                    notificar={notificar}
                />
            )}
        </div>
    );
};

export default AdminLayout;
