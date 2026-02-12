// src/components/ModalManager.js
import React, { useState, useEffect } from 'react';
import { THEME, estilos } from '../config/theme';
import { API_BASE_URL, HEADERS_JSON } from '../config/utils';
import { FormGroup } from './UI';

import { HelpCircle } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 4000, backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s'
        }}>
            <div style={{
                background: 'white', borderRadius: '20px', padding: '30px', width: '400px',
                textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <div style={{
                    width: '60px', height: '60px', borderRadius: '50%', background: '#5e81f440',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px'
                }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#5E81F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <HelpCircle size={24} color="white" strokeWidth={2.5} />
                    </div>
                </div>

                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: '800', color: '#1F2937' }}>Confirmación</h3>
                <p style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#6B7280' }}>¿Estás seguro de <b>guardar los cambios</b>?</p>

                <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <button onClick={onClose} style={{
                        flex: 1, padding: '12px', border: 'none', borderRadius: '8px',
                        background: '#F3F4F6', color: '#374151', fontWeight: '600', cursor: 'pointer'
                    }}>Cancelar</button>
                    <button onClick={onConfirm} style={{
                        flex: 1, padding: '12px', border: 'none', borderRadius: '8px',
                        background: '#5E81F4', color: 'white', fontWeight: '600', cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(94, 129, 244, 0.3)'
                    }}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

const ModalManager = ({ mode, vehiculo, onClose, recargar, notificar }) => {
    // Estado unificado del formulario
    const [form, setForm] = useState({ id: null, licensePlate: '', brand: '', model: '', year: 2024, mileage: 0, status: 'Available', lastMaintenanceKm: 0, maintenanceIntervalKm: 5000 });
    const [showService, setShowService] = useState(false);
    const [servicio, setServicio] = useState({ tipo: 'Preventivo', costo: '', descripcion: '' });
    const [showConfirm, setShowConfirm] = useState(false);

    // Helper para reducir código de peticiones
    const postData = async (url, body) => {
        const res = await fetch(`${API_BASE_URL}${url}`, { method: 'POST', headers: HEADERS_JSON, body: JSON.stringify(body) });
        if (!res.ok) throw new Error(await res.text());
        return res;
    };

    // Carga de datos inicial
    useEffect(() => {
        if (vehiculo) {
            const statusMap = { 'ACTIVO': 'Available', 'INACTIVO': 'Maintenance' };
            setForm({
                ...vehiculo,
                id: vehiculo.id,
                year: vehiculo.year || vehiculo.productionYear || 2024,
                status: statusMap[vehiculo.status] || vehiculo.status || 'Available',
                // Aseguramos valores por defecto si vienen nulos
                licensePlate: vehiculo.licensePlate || '', brand: vehiculo.brand || '', model: vehiculo.model || '',
                mileage: vehiculo.mileage || 0, lastMaintenanceKm: vehiculo.lastMaintenanceKm || 0, maintenanceIntervalKm: vehiculo.maintenanceIntervalKm || 5000
            });
        }
    }, [vehiculo]);

    // Cálculos visuales (Barra de estado)
    // Se usa Math.max(0, ...) para evitar números negativos absurdos (ej. si el usuario pone 0 o un valor bajo por error)
    const kmRecorridos = Math.max(0, form.mileage - form.lastMaintenanceKm);
    const kmRestantes = form.maintenanceIntervalKm - kmRecorridos;
    const estaVencido = kmRestantes < 0;

    // Validación de kilometraje
    // Se compara con vehiculo.mileage (valor original en BD) para evitar inconsistencias
    const originalMileage = parseFloat(vehiculo?.mileage) || 0;
    const currentMileageVal = parseFloat(form.mileage) || 0;
    const maintenanceInterval = parseFloat(form.maintenanceIntervalKm) || 5000;

    // Regla: No permitir saltos mayores a 2x el intervalo
    const maxAllowedMileage = originalMileage + (maintenanceInterval * 2);

    const isMileageTooLow = currentMileageVal < originalMileage || currentMileageVal < 0;
    const isMileageTooHigh = currentMileageVal > maxAllowedMileage;

    const isMileageInvalid = mode === 'edit' && (isMileageTooLow || isMileageTooHigh);

    // --- ACCIÓN 1: Guardar Vehículo (Async/Await para limpieza) ---
    const handleSaveVehicle = async (e) => {
        if (e) e.preventDefault();

        // Bloqueo de seguridad adicional por si se habilita el botón con hacks
        if (isMileageInvalid) return notificar("Corrija el kilometraje antes de guardar.", "error");

        if (!form.id) return notificar("Error: ID inválido.", "error");

        const hasChanges = (form.mileage !== (vehiculo.mileage || 0)) ||
            (form.status !== (vehiculo.status || 'Available')) ||
            (parseInt(form.maintenanceIntervalKm) !== (parseInt(vehiculo.maintenanceIntervalKm) || 5000));
        if (!hasChanges) return notificar("No ha realizado cambios para guardar.", "warning");

        try {
            const payload = { ...form, year: parseInt(form.year), mileage: parseFloat(form.mileage), lastMaintenanceKm: parseFloat(form.lastMaintenanceKm), maintenanceIntervalKm: parseInt(form.maintenanceIntervalKm) };
            await postData('/vehicles', payload);
            notificar("Datos actualizados.", "success");
            onClose(); recargar();
        } catch (err) {
            console.error(err);
            notificar("Error al guardar.", "error");
        }
    };

    // --- PRE-VALIDACIÓN ---
    const requestSaveService = () => {
        if (!servicio.costo || !servicio.descripcion) {
            notificar("Ingrese costo y descripción para continuar.", "warning");
            return;
        }
        setShowConfirm(true);
    };

    // --- ACCIÓN 2: Ejecutar Guardado Real ---
    const executeSaveService = async () => {
        setShowConfirm(false); // Cerrar modal confirmación
        try {
            // 1. Guardar Historial
            await postData('/vehicles/maintenances', {
                date: new Date().toISOString().split('T')[0], type: servicio.tipo, cost: parseFloat(servicio.costo),
                description: servicio.descripcion, mileageAtMaintenance: parseFloat(form.mileage), vehicle: { id: form.id }
            });

            // 2. Actualizar Vehículo (Reset si es Preventivo)
            const nuevoLastKm = servicio.tipo === 'Preventivo' ? form.mileage : form.lastMaintenanceKm;
            await postData('/vehicles', { ...form, year: parseInt(form.year), lastMaintenanceKm: parseFloat(nuevoLastKm), status: 'Available' });

            notificar("Mantenimiento registrado.", "success");
            onClose(); recargar();
        } catch (err) {
            notificar("Error en el proceso.", "error");
        }
    };

    // --- RENDERIZADO ---
    return (
        <div style={estilos.modalOverlay}>
            <div style={estilos.modalCard}>
                {/* Header */}
                <div style={{ borderBottom: '1px solid #e0e0e0', paddingBottom: '15px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, color: THEME.text, fontSize: '18px', fontWeight: '700' }}>
                        {mode === 'edit' ? (
                            <span>
                                ADMINISTRACIÓN: <span style={{ color: '#1e40af', fontWeight: '800' }}>{form.licensePlate.toUpperCase()}</span>
                            </span>
                        ) : `Configuración`}
                    </h3>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#888' }}>×</button>
                </div>

                {mode === 'edit' ? (
                    <div>
                        {/* Barra de Estado del Ciclo */}
                        {(() => {
                            const porcentaje = (kmRecorridos / form.maintenanceIntervalKm) * 100;
                            let estadoTexto = "MANTENIMIENTO EN REGLA";
                            let colorEstado = THEME.success;
                            let bgEstado = '#e8f8f5';

                            if (porcentaje >= 100) {
                                estadoTexto = "MANTENIMIENTO VENCIDO";
                                colorEstado = THEME.danger;
                                bgEstado = '#fdecea';
                            } else if (porcentaje >= 70) {
                                estadoTexto = "MANTENIMIENTO PRÓXIMO";
                                colorEstado = THEME.warning;
                                bgEstado = '#fef5e7'; // Un fondo naranja muy suave
                            }

                            return (
                                <div style={{ background: bgEstado, border: `1px solid ${colorEstado}`, padding: '12px 15px', borderRadius: '6px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: THEME.text }}>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: '700', color: colorEstado }}>{estadoTexto}</div>
                                        <div style={{ fontSize: '13px' }}>Recorrido: <b>{kmRecorridos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km</b> de {form.maintenanceIntervalKm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km</div>
                                    </div>
                                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: colorEstado }}>
                                        {porcentaje >= 100
                                            ? `${Math.abs(kmRestantes).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km exceso`
                                            : `${kmRestantes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km restantes`
                                        }
                                    </div>
                                </div>
                            );
                        })()}

                        {/* Datos Editables */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <FormGroup label="Kilometraje Actual">
                                <input
                                    type="text"
                                    value={form.mileage ? form.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                    onChange={e => {
                                        const val = e.target.value.replace(/,/g, '');
                                        if (/^\d*\.?\d*$/.test(val)) {
                                            setForm({ ...form, mileage: val });
                                        }
                                    }}
                                    style={{
                                        ...estilos.inputBig,
                                        padding: '12px',
                                        // Validación visual: Borde rojo (inválido bajo) o naranja (inválido alto)
                                        borderColor: isMileageInvalid
                                            ? (isMileageTooHigh ? THEME.warning : THEME.danger)
                                            : (estilos.inputBig.borderColor || '#ccc'),
                                        borderWidth: isMileageInvalid ? '2px' : '1px'
                                    }}
                                />
                                {/* Mensaje de Error Contextual */}
                                {isMileageInvalid && (
                                    <div style={{
                                        color: isMileageTooHigh ? THEME.warning : THEME.danger,
                                        fontSize: '12px',
                                        marginTop: '5px',
                                        fontWeight: '500'
                                    }}>
                                        {isMileageTooLow
                                            ? "El kilometraje no puede ser menor al actual."
                                            : (
                                                <span>
                                                    {`Salto inusual (+${(maintenanceInterval * 2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km). El aumento excede el límite de seguridad (2 intervalos). `}
                                                    <span style={{ color: THEME.danger }}>Verifique el número.</span>
                                                </span>
                                            )
                                        }
                                    </div>
                                )}
                            </FormGroup>
                            <FormGroup label="Estado Operativo">
                                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} style={{ ...estilos.inputBig, padding: '12px', fontSize: '20px', borderWidth: '2px', borderColor: form.status === 'Maintenance' ? THEME.danger : THEME.success, color: THEME.text }}>
                                    <option value="Available">ACTIVO</option>
                                    <option value="Maintenance">INACTIVO</option>
                                </select>
                            </FormGroup>
                        </div>

                        {/* Sección Servicios */}
                        <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', margin: '20px 0', border: '1px solid #e9ecef' }}>
                            {!showService ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ fontSize: '13px', color: THEME.textSoft }}>¿Registrar cambio de aceite, reparación o revisión?</div>
                                    <button onClick={() => setShowService(true)} style={{ ...estilos.btnOutlinePrimary, fontSize: '13px' }}>Registrar Mantenimiento</button>
                                </div>
                            ) : (
                                <div className="fade-in">
                                    <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: THEME.accent, borderBottom: '1px solid #ddd' }}>NUEVO REGISTRO</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <FormGroup label="Tipo de Servicio">
                                            <select
                                                style={{
                                                    ...estilos.input,
                                                    padding: '12px', // Reduced padding to match height with Cost input
                                                    fontSize: '17px',
                                                    borderWidth: '2px',
                                                    borderColor: servicio.tipo === 'Preventivo' ? THEME.success : '#fb923c' // Lighter Orange
                                                }}
                                                value={servicio.tipo}
                                                onChange={e => setServicio({ ...servicio, tipo: e.target.value })}
                                            >
                                                <option value="Preventivo">Preventivo</option>
                                                <option value="Correctivo">Correctivo</option>
                                            </select>
                                            <div style={{ marginTop: '5px', fontSize: '12px', fontWeight: '400', color: servicio.tipo === 'Preventivo' ? THEME.success : '#fb923c' }}>
                                                {servicio.tipo === 'Preventivo' ? 'Se reiniciará el contador del ciclo a 0 km.' : 'Mantiene el ciclo actual. No reinicia el contador.'}
                                            </div>
                                        </FormGroup>
                                        <FormGroup label="Costo ($)">
                                            <input
                                                type="text"
                                                style={estilos.input}
                                                placeholder="0.00"
                                                value={servicio.costo ? servicio.costo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/,/g, '');
                                                    if (/^\d*\.?\d*$/.test(val)) {
                                                        setServicio({ ...servicio, costo: val });
                                                    }
                                                }}
                                            />
                                        </FormGroup>
                                    </div>
                                    <FormGroup label="Descripción">
                                        <textarea
                                            style={{ ...estilos.input, height: 'auto', minHeight: '45px', overflow: 'hidden', resize: 'none', fontFamily: 'inherit' }}
                                            placeholder="Detalle..."
                                            value={servicio.descripcion}
                                            onChange={e => {
                                                setServicio({ ...servicio, descripcion: e.target.value });
                                                e.target.style.height = 'auto';
                                                e.target.style.height = `${e.target.scrollHeight}px`;
                                            }}
                                            rows={1}
                                        />
                                    </FormGroup>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '15px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => setShowService(false)} style={{ ...estilos.btnSecondary, width: 'auto', fontSize: '13px' }}>Cancelar</button>
                                        <button onClick={requestSaveService} style={{ ...estilos.btnPrimary, background: THEME.accent, fontSize: '13px' }}>Confirmar</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Datos Técnicos (Solo Lectura) */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                            <FormGroup label="Marca"><input value={form.brand} readOnly style={{ ...estilos.input, background: '#f5f5f5', color: '#777', fontWeight: 'bold' }} /></FormGroup>
                            <FormGroup label="Modelo"><input value={form.model} readOnly style={{ ...estilos.input, background: '#f5f5f5', color: '#777', fontWeight: 'bold' }} /></FormGroup>
                            <FormGroup label="Año"><input value={form.year} readOnly style={{ ...estilos.input, background: '#f5f5f5', color: '#777', fontWeight: 'bold' }} /></FormGroup>
                        </div>
                        <div style={{ marginTop: '25px', display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    ...estilos.btnSecondary,
                                    opacity: showService ? 0.5 : 1,
                                    cursor: showService ? 'not-allowed' : 'pointer'
                                }}
                                disabled={showService}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveVehicle}
                                // Explicitly handle background to ensure it returns to Theme Primary when active
                                style={{
                                    ...estilos.btnPrimary,
                                    background: (isMileageInvalid || showService) ? '#cccccc' : THEME.primary,
                                    opacity: (isMileageInvalid || showService) ? 0.5 : 1,
                                    cursor: (isMileageInvalid || showService) ? 'not-allowed' : 'pointer'
                                }}
                                disabled={isMileageInvalid || showService}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                ) : (
                    // Modo Reglas
                    <form onSubmit={handleSaveVehicle}>
                        {/* Nota de Advertencia Estilizada */}
                        <div style={{
                            background: '#fffbf0',
                            padding: '16px 20px',
                            borderRadius: '12px',
                            marginBottom: '30px',
                            border: '1px solid #fceecb',
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'start'
                        }}>
                            <span style={{ fontSize: '18px' }}>💡</span>
                            <div>
                                <div style={{ fontSize: '14px', fontWeight: '700', color: '#b7791f', marginBottom: '4px' }}>Importante</div>
                                <div style={{ fontSize: '13px', color: '#975a16', lineHeight: '1.5' }}>
                                    Modificar el intervalo base recalculará automáticamente el estado de <b>todas las alertas</b> de mantenimiento para este vehículo.
                                </div>
                            </div>
                        </div>

                        <FormGroup label="Intervalo de Mantenimiento (Km)">
                            <div style={{ marginBottom: '8px', fontSize: '12px', color: '#64748b' }}>Define cada cuántos kilómetros se debe realizar el servicio.</div>
                            <input
                                type="text"
                                value={form.maintenanceIntervalKm ? form.maintenanceIntervalKm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                                onChange={e => {
                                    const val = e.target.value.replace(/,/g, '');
                                    if (/^\d*$/.test(val)) {
                                        if (parseInt(val) > 50000) return;
                                        setForm({ ...form, maintenanceIntervalKm: val });
                                    }
                                }}
                                style={{
                                    ...estilos.inputBig,
                                    borderColor: '#e2e8f0',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                                    fontSize: '28px',
                                    padding: '16px 20px',
                                    color: THEME.primary
                                }}
                            />
                        </FormGroup>

                        <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '12px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
                            <button type="button" onClick={onClose} style={{ ...estilos.btnSecondary, background: 'transparent', border: '1px solid #cbd5e1' }}>Cancelar</button>
                            <button type="submit" style={{ ...estilos.btnPrimary, padding: '12px 30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>Guardar Configuración</button>
                        </div>
                    </form>
                )}

                <ConfirmationModal
                    isOpen={showConfirm}
                    onClose={() => setShowConfirm(false)}
                    onConfirm={executeSaveService}
                />
            </div>
        </div>
    );
};

export default ModalManager;