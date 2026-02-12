import React from 'react';
import { THEME } from '../config/theme';
import { calcularMetricas } from '../config/utils';
import { CheckCircle, AlertTriangle, XCircle, Info, ChevronRight, Clock } from 'lucide-react';

// --- Contenedores y Botones ---
export const FormGroup = ({ label, children, icon: Icon }) => (
    <div style={{ marginBottom: '24px' }}>
        <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            fontSize: '13px',
            fontWeight: '600',
            color: THEME.textSoft,
            letterSpacing: '0.3px'
        }}>
            {Icon && <Icon size={14} />}
            {label}
        </label>
        {children}
    </div>
);

export const MenuButton = ({ label, active, onClick, icon: Icon }) => (
    <button onClick={onClick} style={{
        width: '100%',
        textAlign: 'left',
        padding: '12px 24px',
        background: active ? 'rgba(255,255,255,0.1)' : 'transparent',
        color: active ? '#fff' : '#9CA3AF',
        border: 'none',
        cursor: 'pointer',
        borderLeft: active ? `4px solid ${THEME.accent}` : '4px solid transparent',
        fontWeight: active ? '600' : '500',
        transition: 'all 0.2s',
        fontSize: '14px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '0 8px 8px 0',
        margin: '4px 0'
    }}>
        {Icon && <Icon size={18} color={active ? '#fff' : '#9CA3AF'} />}
        {label}
        {active && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
    </button>
);

export const MetricCard = ({ title, value, color, icon: Icon }) => (
    <div style={{
        background: `linear-gradient(135deg, #ffffff 50%, ${color}15 100%)`,
        padding: '24px',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        border: '1px solid #f3f4f6',
        borderLeft: `5px solid ${color}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'transform 0.2s',
    }}>
        <div>
            <div style={{
                fontSize: '13px',
                textTransform: 'uppercase',
                color: '#6B7280',
                fontWeight: '700',
                letterSpacing: '0.5px',
                marginBottom: '4px'
            }}>{title}</div>
            <div style={{
                fontSize: '36px',
                fontWeight: '800',
                color: color,
                lineHeight: '1'
            }}>{value}</div>
        </div>

        {Icon && (
            <div style={{
                padding: '12px',
                borderRadius: '12px',
                background: `${color}10`, // Very subtle background
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Icon size={28} color={color} strokeWidth={2} />
            </div>
        )}
    </div>
);

// --- AlertCard ACTUALIZADA ---
export const AlertCard = ({ vehiculo, onClick }) => {
    const m = calcularMetricas(vehiculo);
    return (
        <div onClick={onClick} className="card-hover" style={{
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            marginBottom: '16px',
            // borderLeft: `4px solid ${m.color}`, // REMOVED as per user request
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(0,0,0,0.02)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Updated Plate Style */}
                    <span style={{ fontWeight: '800', color: '#1e40af', fontSize: '15px', letterSpacing: '0.5px', fontFamily: "'Poppins', sans-serif", marginBottom: '2px' }}>{vehiculo.licensePlate}</span>
                    <span style={{ fontSize: '13px', color: THEME.textSoft }}>{vehiculo.brand} {vehiculo.model}</span>
                </div>
                <span style={{
                    fontSize: '11px',
                    color: m.color,
                    fontWeight: '800',
                    background: `${m.color}15`,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    {m.restante <= 0 && <AlertTriangle size={12} />}
                    {m.estadoMant === 'AMARILLO' && <Clock size={12} />}
                    {m.estadoMant === 'ROJO' ? 'VENCIDO' : m.estadoMant === 'AMARILLO' ? 'PRÓXIMO' : 'EN REGLA'}
                </span>
            </div>

            <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: THEME.textSoft }}>
                    <span>Progreso Mantenimiento</span>
                    {/* Logic for Exceso */}
                    <span style={{ fontWeight: '700', color: m.restante < 0 ? THEME.danger : THEME.text }}>
                        {m.restante < 0 ? `${Math.abs(m.restante)} km exceso` : `${m.restante} km restantes`}
                    </span>
                </div>
                <ProgressBar porcentaje={m.porcentaje} color={m.color} />
            </div>
        </div>
    );
};

export const ProgressBar = ({ porcentaje, color, height = '6px' }) => (
    <div style={{ width: '100%', background: '#F3F4F6', borderRadius: '10px', height: height, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(porcentaje, 100)}%`, background: color, height: '100%', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }} />
    </div>
);

export const StatusBadge = ({ status }) => {
    const isActive = status === 'Available' || status === 'Activo';
    return (
        <span style={{
            background: isActive ? '#ECFDF5' : '#FEF2F2',
            color: isActive ? '#059669' : '#DC2626',
            padding: '4px 8px',
            borderRadius: '30px',
            fontSize: '11px',
            fontWeight: '800',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: `2px solid ${isActive ? '#D1FAE5' : '#FEE2E2'}`
        }}>
            <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: isActive ? '#059669' : '#DC2626' }}></span>
            {isActive ? 'ACTIVO' : 'INACTIVO'}
        </span>
    );
};

export const ToastNotification = ({ msg, type }) => {
    const isError = type === 'error';
    const isSuccess = type === 'success';

    const bg = isError ? '#FEF2F2' : (isSuccess ? '#ECFDF5' : '#EFF6FF');
    const border = isError ? '#FCA5A5' : (isSuccess ? '#6EE7B7' : '#93C5FD');
    const text = isError ? '#991B1B' : (isSuccess ? '#065F46' : '#1E40AF');
    const Icon = isError ? XCircle : (isSuccess ? CheckCircle : Info);

    return (
        <div className="fade-in" style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            background: bg,
            color: text,
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 2000,
            fontWeight: '500',
            fontSize: '14px',
            minWidth: '300px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: `1px solid ${border}`
        }}>
            <Icon size={20} />
            {msg}
        </div>
    );
};
