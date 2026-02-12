import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { estilos, THEME } from '../config/theme';
import { API_BASE_URL, HEADERS_JSON } from '../config/utils';
import { FormGroup } from '../components/UI';
import { FileText, Search, Download, Calendar, DollarSign, List, Filter, Truck, Settings, Activity, AlertCircle } from 'lucide-react';

const ReportsView = () => {
    const [activeTab, setActiveTab] = useState('global');
    const [historialGlobal, setHistorialGlobal] = useState([]);
    const [historialIndividual, setHistorialIndividual] = useState([]);

    // Inicialización del mes (Source Logic)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
    const [mesFiltro, setMesFiltro] = useState(`${currentYear}-${currentMonth}`);

    const [placaBusqueda, setPlacaBusqueda] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    // Estado para validación (Source Logic)
    const [errorPlaca, setErrorPlaca] = useState("");
    const [searchPerformed, setSearchPerformed] = useState(false);

    // Componente ErrorTooltip (Copiado para consistencia)
    const ErrorTooltip = ({ message }) => (
        <div style={{
            position: 'relative',
            marginTop: '8px',
            animation: 'slideDown 0.3s ease-out',
            zIndex: 10
        }}>
            <div style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                color: 'white',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '500',
                boxShadow: '0 4px 12px rgba(238, 90, 111, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <span style={{
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '20px',
                    height: '20px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%'
                }}>!</span>
                <span>{message}</span>
            </div>
            <div style={{
                position: 'absolute',
                top: '-6px',
                left: '20px',
                width: '0',
                height: '0',
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderBottom: '6px solid #ff6b6b'
            }}></div>
        </div>
    );

    useEffect(() => {
        setLoadingGlobal(true);
        fetch(`${API_BASE_URL}/vehicles/maintenances/all`, { headers: HEADERS_JSON })
            .then(res => res.json())
            .then(data => setHistorialGlobal(Array.isArray(data) ? data : []))
            .catch(err => console.error(err))
            .finally(() => setLoadingGlobal(false));
    }, []);

    const buscarHistorialIndividual = (e) => {
        e.preventDefault();

        // Validación portada (Source Logic)
        if (!placaBusqueda.trim()) {
            setErrorPlaca("Ingrese un número de placa");
            return;
        }

        // Regex Validation
        const placaRegex = /^[A-Z]{3}-\d{4}$/;
        if (!placaRegex.test(placaBusqueda)) {
            setErrorPlaca("Formato inválido. Debe ser AAA-1234");
            return;
        }

        setErrorPlaca("");
        setLoading(true);
        fetch(`${API_BASE_URL}/vehicles/search/${placaBusqueda}`, { headers: HEADERS_JSON })
            .then(res => {
                if (!res.ok) throw new Error("Vehículo no encontrado");
                return res.json();
            })
            .then(vehiculo => {
                return fetch(`${API_BASE_URL}/vehicles/${vehiculo.id}/history`, { headers: HEADERS_JSON });
            })
            .then(res => res.json())
            .then(data => {
                setHistorialIndividual(Array.isArray(data) ? data : []);
                setSearchPerformed(true);
                setLoading(false);
            })
            .catch(err => {
                setErrorPlaca(err.message === "Vehículo no encontrado" ? "Vehículo no encontrado" : err.message);
                setHistorialIndividual([]);
                setLoading(false);
            });
    };

    const exportToExcel = (data, fileName) => {
        if (!data || data.length === 0) return alert("No hay datos para exportar");
        const excelData = data.map(item => ({
            Fecha: item.date,
            Placa: item.vehicle ? item.vehicle.licensePlate : 'N/A',
            Tipo: item.type,
            Kilometraje: item.mileageAtMaintenance,
            Detalle: item.description,
            Costo: item.cost
        }));
        const totalCost = excelData.reduce((sum, item) => sum + (item.Costo || 0), 0);
        excelData.push({ Fecha: 'TOTAL GENERAL', Costo: totalCost });
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");
        XLSX.writeFile(workbook, `${fileName}.xlsx`);
    };

    const reporteFiltrado = historialGlobal.filter(h => h.date && h.date.startsWith(mesFiltro));
    const totalGasto = reporteFiltrado.reduce((sum, h) => sum + (h.cost || 0), 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

            <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid #E5E7EB', paddingBottom: '0' }}>
                <button
                    onClick={() => setActiveTab('global')}
                    style={activeTab === 'global' ? estilos.tabActive : estilos.tab}
                >
                    <List size={16} style={{ marginRight: '8px' }} /> Reporte Mensual Global
                </button>
                <button
                    onClick={() => setActiveTab('individual')}
                    style={activeTab === 'individual' ? estilos.tabActive : estilos.tab}
                >
                    <FileText size={16} style={{ marginRight: '8px' }} /> Historial por Unidad
                </button>
            </div>

            {activeTab === 'global' ? (
                <div className="fade-in">
                    <div style={{
                        background: 'linear-gradient(135deg, white 0%, #F9FAFB 100%)',
                        padding: '30px',
                        borderRadius: '16px',
                        boxShadow: THEME.shadow,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        border: '1px solid #E5E7EB',
                        marginBottom: '30px'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            <div style={{ background: '#EEF2FF', padding: '15px', borderRadius: '12px' }}>
                                <DollarSign size={32} color={THEME.primary} />
                            </div>
                            <div>
                                <h4 style={{ margin: 0, color: THEME.textSoft, fontSize: '13px', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Gasto Total del Mes</h4>
                                <div style={{ fontSize: '36px', fontWeight: '800', color: '#1e3a8a', letterSpacing: '-1px', lineHeight: '1.2' }}>${totalGasto.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {/* Selector de Periodo Estilizado (Source Logic) */}
                            <div
                                onClick={() => document.getElementById('periodoInput').showPicker()}
                                style={{
                                    background: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    border: '1px solid #E5E7EB',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                                    cursor: 'pointer',
                                    height: '56px',
                                    minWidth: '220px',
                                    position: 'relative',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.borderColor = THEME.primary;
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.borderColor = '#E5E7EB';
                                    e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.03)';
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: '#F3F4F6',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <Calendar size={20} color="#374151" strokeWidth={2} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '10px' }}>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '10px',
                                        fontWeight: '700',
                                        color: '#9CA3AF',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px',
                                        marginBottom: '2px',
                                        lineHeight: 1
                                    }}>
                                        PERIODO
                                    </label>
                                    <div style={{
                                        fontWeight: '800',
                                        fontSize: '15px',
                                        color: '#1F2937',
                                        lineHeight: 1.2
                                    }}>
                                        {(() => {
                                            const [año, mes] = mesFiltro.split('-');
                                            const fecha = new Date(parseInt(año), parseInt(mes) - 1, 1);
                                            const mesNombre = fecha.toLocaleString('es-ES', { month: 'long' });
                                            return `${mesNombre.charAt(0).toUpperCase() + mesNombre.slice(1)} de ${año}`;
                                        })()}
                                    </div>
                                    <input
                                        id="periodoInput"
                                        type="month"
                                        value={mesFiltro}
                                        onChange={e => setMesFiltro(e.target.value)}
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer',
                                            zIndex: -1
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={() => exportToExcel(reporteFiltrado, `Reporte_Global_${mesFiltro}`)}
                                style={{
                                    ...estilos.btnExcel,
                                    height: '56px',
                                    padding: '0 24px',
                                    borderRadius: '12px',
                                    fontSize: '14px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                            >
                                <Download size={18} /> Descargar Excel
                            </button>
                        </div>
                    </div>

                    <div style={estilos.tableCard}>
                        {loadingGlobal ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: THEME.textSoft }}>Cargando reportes...</div>
                        ) : (
                            <TableHistory data={reporteFiltrado} showPlaca={true} />
                        )}
                    </div>
                </div>
            ) : (
                <div className="fade-in">
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: THEME.shadow, marginBottom: '30px', border: '1px solid #E5E7EB' }}>
                        <form onSubmit={buscarHistorialIndividual}>
                            <FormGroup label="Buscar historial por placa" icon={Search}>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', height: '50px', alignItems: 'stretch' }}>
                                            <input
                                                type="text"
                                                placeholder="Ingrese placa (Ej: PBA-1234)"
                                                value={placaBusqueda}
                                                onChange={e => {
                                                    let val = e.target.value.toUpperCase();
                                                    if (val.length === 3 && placaBusqueda.length === 2) val += '-';
                                                    setPlacaBusqueda(val);
                                                    setErrorPlaca("");
                                                    setSearchPerformed(false);
                                                }}
                                                maxLength={8}
                                                style={{
                                                    ...estilos.inputBig,
                                                    borderTopRightRadius: 0,
                                                    borderBottomRightRadius: 0,
                                                    fontSize: '15px',
                                                    fontWeight: '400',
                                                    borderRight: 'none',
                                                    flex: 1
                                                }}
                                            />
                                            <button type="submit" style={{
                                                background: '#1e293b',
                                                color: 'white',
                                                border: 'none',
                                                padding: '0 40px',
                                                borderTopRightRadius: '10px',
                                                borderBottomRightRadius: '10px',
                                                cursor: 'pointer',
                                                fontWeight: '700',
                                                fontSize: '14px',
                                                letterSpacing: '0.5px'
                                            }}>
                                                BUSCAR
                                            </button>
                                        </div>
                                        {/* Tooltip de error aquí - Afecta solo la altura de esta columna */}
                                        {errorPlaca && errorPlaca !== "Vehículo no encontrado" && <ErrorTooltip message={errorPlaca} />}
                                    </div>

                                    {historialIndividual.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => exportToExcel(historialIndividual, `Historial_${placaBusqueda}`)}
                                            style={{
                                                ...estilos.btnExcel,
                                                height: '50px',
                                                padding: '0 24px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '10px',
                                                borderRadius: '10px',
                                                fontSize: '14px',
                                                background: '#15803d',
                                                color: 'white',
                                                border: 'none',
                                                marginTop: 0 // Alineado arriba con el input
                                            }}
                                        >
                                            <Download size={18} /> Descargar Historial
                                        </button>
                                    )}
                                </div>
                            </FormGroup>
                        </form>
                    </div>

                    {errorPlaca === "Vehículo no encontrado" ? (
                        <div className="fade-in" style={{
                            textAlign: 'center',
                            padding: '60px 20px',
                            color: THEME.textSoft,
                            border: '2px dashed #fecaca',
                            borderRadius: '16px',
                            background: '#fef2f2'
                        }}>
                            <div style={{
                                width: '64px', height: '64px', background: '#fee2e2', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'
                            }}>
                                <AlertCircle size={32} color={THEME.danger} />
                            </div>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px' }}>
                                Vehículo no encontrado
                            </p>
                            <p style={{ fontSize: '14px', color: '#b91c1c' }}>
                                No se encontró ningún vehículo registrado con la placa <span style={{ fontWeight: '800' }}>{placaBusqueda}</span>.
                            </p>
                        </div>
                    ) : historialIndividual.length > 0 ? (
                        <div style={estilos.tableCard}>
                            <div style={{ padding: '20px', borderBottom: '1px solid #eee', background: '#F9FAFB' }}>
                                <h4 style={{ margin: 0 }}>Resultados para: <span style={{ color: THEME.primary }}>{placaBusqueda.toUpperCase()}</span></h4>
                            </div>
                            <TableHistory data={historialIndividual} showPlaca={false} />
                        </div>
                    ) : (
                        !loading && (
                            searchPerformed ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: THEME.textSoft,
                                    border: '2px dashed #E5E7EB',
                                    borderRadius: '16px',
                                    background: '#F9FAFB'
                                }}>
                                    <div style={{
                                        width: '64px', height: '64px', background: '#FEF2F2', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px'
                                    }}>
                                        <FileText size={32} color={THEME.danger} />
                                    </div>
                                    <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>
                                        Sin Historial Registrado
                                    </p>
                                    <p style={{ fontSize: '14px', color: '#6B7280' }}>
                                        El vehículo existe pero aún no tiene mantenimientos registrados.
                                    </p>
                                </div>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    color: THEME.textSoft,
                                    border: '2px dashed #E5E7EB',
                                    borderRadius: '16px',
                                    background: '#F9FAFB'
                                }}>
                                    <Search size={48} color="#D1D5DB" style={{ marginBottom: '15px' }} />
                                    <p style={{ fontSize: '16px', fontWeight: '500' }}>Ingrese una placa válida para consultar su hoja de vida y mantenimientos.</p>
                                </div>
                            )
                        )
                    )}
                    {loading && <div style={{ textAlign: 'center', padding: '20px', color: THEME.textSoft }}>Buscando información...</div>}
                </div>
            )}

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

const TableHistory = ({ data, showPlaca }) => {
    // Helper para encabezados con iconos y anchos específicos
    const ThWithIcon = ({ icon: Icon, label, width }) => (
        <th style={{
            ...estilos.th,
            verticalAlign: 'middle',
            padding: '16px 10px', // Reducir padding horizontal
            width: width // Asignar ancho específico
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6B7280' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(107, 114, 128, 0.1)', padding: '5px', borderRadius: '6px'
                }}>
                    <Icon size={14} strokeWidth={2} style={{ opacity: 0.7 }} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
            </div>
        </th>
    );

    return (
        <div style={{ overflowX: 'auto' }}>
            <table style={{ ...estilos.table, tableLayout: 'fixed' }}> {/* Table Layout Fixed para respetar anchos */}
                <thead>
                    <tr>
                        <ThWithIcon icon={Calendar} label="FECHA" width="12%" />
                        {showPlaca && <ThWithIcon icon={Truck} label="PLACA" width="10%" />}
                        <ThWithIcon icon={Settings} label="TIPO SERVICIO" width="13%" />
                        <ThWithIcon icon={Activity} label="KM REGISTRADO" width="15%" />
                        <ThWithIcon icon={FileText} label="DETALLE / OBSERVACIÓN" width="auto" />
                        <ThWithIcon icon={DollarSign} label="COSTO" width="10%" />
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr><td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#9CA3AF' }}>No hay registros de mantenimiento en este periodo.</td></tr>
                    ) : (
                        data.map((h, i) => (
                            <tr key={i} style={{ ...estilos.tr, background: 'white', borderBottom: '1px solid #F3F4F6' }}>
                                <td style={{ ...estilos.td, padding: '16px 10px', whiteSpace: 'nowrap' }}>
                                    <span style={{ fontWeight: '500', color: '#374151', fontSize: '13px' }}>{h.date}</span>
                                </td>
                                {showPlaca && <td style={{ ...estilos.td, padding: '16px 10px', fontWeight: '800', color: '#1e40af', fontSize: '15px', fontFamily: "'Poppins', sans-serif", letterSpacing: '0.5px' }}>{h.vehicle ? h.vehicle.licensePlate : 'N/A'}</td>}
                                <td style={{ ...estilos.td, padding: '16px 10px' }}>
                                    <span style={{
                                        padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '700',
                                        background: h.type === 'Preventivo' ? '#ECFDF5' : '#FFFBEB',
                                        color: h.type === 'Preventivo' ? THEME.success : THEME.warning,
                                        border: `1px solid ${h.type === 'Preventivo' ? '#D1FAE5' : '#FEF3C7'}`
                                    }}>
                                        {h.type}
                                    </span>
                                </td>
                                <td style={{ ...estilos.td, padding: '16px 10px', color: '#4B5563', fontWeight: '500', fontSize: '14px' }}>{h.mileageAtMaintenance.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} km</td>
                                <td style={{
                                    ...estilos.td,
                                    padding: '16px 10px',
                                    color: '#6B7280',
                                    whiteSpace: 'normal',
                                    wordBreak: 'break-word',
                                    fontSize: '13px',
                                    lineHeight: '1.4'
                                }}>
                                    {h.description}
                                </td>
                                <td style={{ ...estilos.td, padding: '16px 10px', fontWeight: '800', color: '#1e3a8a', fontSize: '14px' }}>${h.cost.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ReportsView;
