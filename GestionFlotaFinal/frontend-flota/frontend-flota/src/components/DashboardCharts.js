import React from 'react';
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, ReferenceLine, LabelList
} from 'recharts';
import { THEME } from '../config/theme';
import { TrendingUp, PieChart as PieIcon } from 'lucide-react';

const ChartCard = ({ title, icon: Icon, children }) => (
    <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '24px',
        boxShadow: `0 10px 25px -5px rgba(0,0,0,0.05)`,
        border: `1px solid rgba(0,0,0,0.05)`,
        display: 'flex',
        flexDirection: 'column',
        height: '420px',
        transition: 'transform 0.2s'
    }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
            <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '12px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: `0 4px 10px rgba(59, 130, 246, 0.15)`
            }}>
                <Icon size={24} color={THEME.primary} />
            </div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: THEME.text, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
        </div>
        <div style={{ flex: 1, width: '100%', minHeight: 0, position: 'relative' }}>
            {children}
        </div>
    </div>
);

const DashboardCharts = ({ vehiculos, maintenances = [] }) => {
    // Asegurar que maintenances siempre sea un array
    const safeMaintenances = Array.isArray(maintenances) ? maintenances : [];

    // 1. Procesar Gastos Mensuales (Mejorado)
    const processMonthlyExpenses = () => {
        const expenses = {};

        safeMaintenances.forEach(m => {
            const dateObj = new Date(m.date);
            const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
            const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset);

            const monthName = adjustedDate.toLocaleString('es-ES', { month: 'short' });
            const label = monthName.charAt(0).toUpperCase() + monthName.slice(1);

            if (!expenses[label]) {
                expenses[label] = { total: 0, maxCost: 0, topVehicle: 'N/A' };
            }

            expenses[label].total += m.cost;

            // Track top spender
            if (m.cost > expenses[label].maxCost) {
                expenses[label].maxCost = m.cost;
                expenses[label].topVehicle = m.vehicle ? m.vehicle.licensePlate : 'N/A';
            }
        });

        const data = Object.keys(expenses).map(key => ({
            name: key,
            monto: expenses[key].total,
            topVehicle: expenses[key].topVehicle,
            maxSingleCost: expenses[key].maxCost
        }));

        // Calcular Promedio Global
        const totalSum = data.reduce((acc, curr) => acc + curr.monto, 0);
        const average = data.length > 0 ? totalSum / data.length : 0;

        return { data, average };
    };

    // 2. Procesar Tipos de Mantenimiento (Mejorado)
    const processMaintenanceTypes = () => {
        const types = {
            'Preventivo': { count: 0, totalCost: 0 },
            'Correctivo': { count: 0, totalCost: 0 }
        };

        let totalCount = 0;

        safeMaintenances.forEach(m => {
            if (types[m.type]) {
                types[m.type].count++;
                types[m.type].totalCost += m.cost;
                totalCount++;
            }
        });

        const data = Object.keys(types).map(key => ({
            name: key,
            value: types[key].count,
            avgCost: types[key].count > 0 ? types[key].totalCost / types[key].count : 0
        })).filter(item => item.value > 0);

        return { data, totalCount };
    };

    const { data: dataExpenses, average: avgExpense } = processMonthlyExpenses();
    const { data: dataTypes, totalCount } = processMaintenanceTypes();

    const formatCurrency = (value) => {
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    const COLORS = [THEME.success, THEME.warning, THEME.danger, THEME.primary];

    // Custom Tooltip para Gastos
    const CustomExpenseTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ background: 'white', padding: '15px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                    <p style={{ fontWeight: 'bold', marginBottom: '5px', color: '#1f2937' }}>{label}</p>
                    <p style={{ color: THEME.primary, fontWeight: '800', fontSize: '18px', margin: 0 }}>
                        ${formatCurrency(data.monto)}
                    </p>
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280', borderTop: '1px solid #f3f4f6', paddingTop: '8px' }}>
                        <div>Mayor Gasto: <span style={{ fontWeight: 'bold', color: '#374151' }}>{data.topVehicle}</span></div>
                        <div>Monto: ${formatCurrency(data.maxSingleCost)}</div>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Custom Tooltip para Tipos
    const CustomTypeTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{ background: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
                    <p style={{ fontWeight: 'bold', color: payload[0].fill, marginBottom: '4px' }}>{data.name}</p>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        Costo Promedio: <b>${formatCurrency(Math.round(data.avgCost))}</b>
                    </div>
                </div>
            );
        }
        return null;
    };

    const [activeIndex, setActiveIndex] = React.useState(null);

    const getTooltipPosition = () => {
        if (activeIndex === 0) return { x: 10, y: 10 }; // Top Left (Green)
        if (activeIndex === 1) return { x: 250, y: 300 }; // Bottom Right (Orange) - adjusted
        return undefined;
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '25px', marginTop: '30px' }}>
            {/* Gráfico de Barras + Línea: Gastos */}
            <ChartCard title="Gastos Mensuales" icon={TrendingUp}>
                {dataExpenses.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={dataExpenses} margin={{ top: 30, right: 130, left: 40, bottom: 20 }} barCategoryGap="50%">
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(value) => `$${formatCurrency(value)}`} />
                            <Tooltip content={<CustomExpenseTooltip />} cursor={{ fill: '#f9fafb' }} />

                            {/* Línea de Promedio */}
                            <ReferenceLine
                                y={avgExpense}
                                stroke="orange"
                                strokeDasharray="3 3"
                                label={({ viewBox }) => {
                                    const rightEdge = viewBox.x + viewBox.width;
                                    return (
                                        <g>
                                            <line
                                                x1={rightEdge}
                                                y1={viewBox.y}
                                                x2={rightEdge + 50}
                                                y2={viewBox.y}
                                                stroke="orange"
                                                strokeDasharray="3 3"
                                            />
                                            <text x={rightEdge + 50} y={viewBox.y} textAnchor="start">
                                                <tspan x={rightEdge + 50} dy="-10" fill="orange" fontSize={14} fontWeight="bold">Avg</tspan>
                                                <tspan x={rightEdge + 50} dy="35" fill="#059669" fontSize={16} fontWeight="900">${formatCurrency(Math.round(avgExpense))}</tspan>
                                            </text>
                                        </g>
                                    );
                                }}
                            />

                            {/* Barras con Etiquetas */}
                            <Bar dataKey="monto" fill={THEME.primary} radius={[6, 6, 0, 0]} barSize={28}>
                                <LabelList dataKey="monto" position="top" offset={10} formatter={(val) => `$${formatCurrency(val)}`} style={{ fill: '#374151', fontSize: '14px', fontWeight: 'bold' }} />
                            </Bar>

                            {/* Línea de Tendencia Suavizada */}
                            <Line type="monotone" dataKey="monto" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'white' }} activeDot={{ r: 6 }} />
                        </ComposedChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: THEME.textSoft }}>
                        Sin datos financieros registrados
                    </div>
                )}
            </ChartCard>

            {/* Gráfico Circular: Tipos */}
            <ChartCard title="Tipos de Mantenimiento" icon={PieIcon}>
                {dataTypes.length > 0 ? (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={dataTypes}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80} // Anillo más fino y moderno
                                    outerRadius={110}
                                    cornerRadius={8} // Bordes redondeados modernos
                                    paddingAngle={5}
                                    dataKey="value"
                                    onMouseEnter={(_, index) => setActiveIndex(index)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {dataTypes.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTypeTooltip />} position={getTooltipPosition()} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                    formatter={(value, entry) => {
                                        const { payload } = entry;
                                        const percent = ((payload.value / totalCount) * 100).toFixed(0);
                                        return <span style={{ color: '#374151', fontWeight: '500', marginLeft: '5px' }}>{value} ({percent}%)</span>;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Texto Central (Donut Hole) */}
                        <div style={{
                            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)',
                            textAlign: 'center', pointerEvents: 'none'
                        }}>
                            <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827', lineHeight: '1' }}>{totalCount}</div>
                            <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: '600', marginTop: '4px' }}>Total</div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: THEME.textSoft }}>
                        Sin mantenimientos registrados
                    </div>
                )}
            </ChartCard>
        </div>
    );
};

export default DashboardCharts;
