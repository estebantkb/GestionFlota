import React, { useState, useRef } from 'react';
import { estilos, THEME } from '../config/theme';
import { API_BASE_URL, HEADERS_JSON } from '../config/utils';
import { FormGroup } from '../components/UI';
import { Car, Tag, Calendar, Activity, PenTool, CheckCircle } from 'lucide-react';

const RegisterView = ({ recargar, notificar }) => {
    const [form, setForm] = useState({
        licensePlate: '',
        brand: '',
        model: '',
        year: '',
        mileage: '',
        status: 'Available',
        lastMaintenanceKm: 0,
        maintenanceIntervalKm: ''
    });

    const [errors, setErrors] = useState({
        licensePlate: '',
        brand: '',
        model: '',
        year: '',
        mileage: '',
        maintenanceIntervalKm: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Referencias para inputs
    const placaRef = useRef();
    const marcaRef = useRef();
    const modeloRef = useRef();
    const anioRef = useRef();
    const kmRef = useRef();
    const intervaloRef = useRef();

    // Orden de campos para validación secuencial
    const orderedFields = [
        { name: 'licensePlate', ref: placaRef },
        { name: 'brand', ref: marcaRef },
        { name: 'model', ref: modeloRef },
        { name: 'year', ref: anioRef },
        { name: 'mileage', ref: kmRef },
        { name: 'maintenanceIntervalKm', ref: intervaloRef }
    ];

    // Componentes de Feedback Visual
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

    const SuccessMessage = ({ message }) => (
        <div style={{
            marginTop: '8px',
            color: THEME.success,
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            animation: 'fadeIn 0.3s ease-out'
        }}>
            <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '16px',
                height: '16px',
                background: THEME.success,
                color: 'white',
                borderRadius: '50%',
                fontSize: '10px',
                fontWeight: 'bold'
            }}>✓</span>
            <span>{message}</span>
        </div>
    );

    // Lógica de Validación
    const validateField = (fieldName, value) => {
        let error = '';

        switch (fieldName) {
            case 'licensePlate':
                if (!value || value.trim() === '') {
                    error = 'La placa es obligatoria';
                } else if (!/^[A-Z]{3}-[0-9]{4}$/.test(value)) {
                    error = 'Formato inválido. Debe ser ABC-1234';
                }
                break;

            case 'brand':
                if (!value || value.trim() === '') {
                    error = 'La marca es obligatoria';
                }
                break;

            case 'model':
                if (!value || value.trim() === '') {
                    error = 'El modelo es obligatorio';
                }
                break;

            case 'year':
                if (!value || value === '' || value === 0) {
                    error = 'El año de fabricación es obligatorio';
                } else if (value < 1900) {
                    error = 'El año no puede ser menor a 1900';
                } else if (value > 2026) {
                    error = 'El año no puede ser mayor a 2026';
                }
                break;

            case 'mileage':
                if (form.year < 2026) {
                    if (!value || value === '' || value === 0 || value === '0') {
                        error = 'El kilometraje inicial es obligatorio';
                    } else if (value < 0) {
                        error = 'El kilometraje no puede ser negativo';
                    }
                } else {
                    if (value && value < 0) {
                        error = 'El kilometraje no puede ser negativo';
                    }
                }
                break;

            case 'maintenanceIntervalKm':
                if (!value || value === 0 || value === '0' || value === '') {
                    error = 'El intervalo de servicio es obligatorio';
                } else if (value < 1000) {
                    error = 'El intervalo debe ser al menos 1,000 km';
                } else if (value > 50000) {
                    error = 'El intervalo no puede exceder 50,000 km';
                }
                break;
            default:
                break;
        }

        setErrors(prev => ({ ...prev, [fieldName]: error }));
        return error === '';
    };

    const handleFieldFocus = (fieldName) => {
        for (const field of orderedFields) {
            if (field.name === fieldName) break;
            if (!validateField(field.name, form[field.name])) {
                if (field.ref.current) field.ref.current.focus();
                return false;
            }
        }
        return true;
    };

    const handleInputChange = (fieldName, value) => {
        if (!handleFieldFocus(fieldName)) return;

        const newForm = { ...form, [fieldName]: value };
        setForm(newForm);

        // Validación inmediata
        validateField(fieldName, value);

        if (fieldName === 'year') {
            validateField('mileage', form.mileage);
        }
    };

    const submit = (e) => {
        e.preventDefault();

        for (const field of orderedFields) {
            if (!validateField(field.name, form[field.name])) {
                if (field.ref.current) field.ref.current.focus();
                notificar('Por favor, complete los campos en orden antes de continuar', 'error');
                return;
            }
        }

        const fieldsToValidate = ['licensePlate', 'brand', 'model', 'year', 'mileage', 'maintenanceIntervalKm'];
        let hasErrors = false;

        fieldsToValidate.forEach(field => {
            if (!validateField(field, form[field])) {
                hasErrors = true;
            }
        });

        if (hasErrors) {
            notificar("Por favor corrige los errores antes de continuar", "error");
            return;
        }

        setIsSubmitting(true);

        const payload = {
            ...form,
            licensePlate: form.licensePlate.toUpperCase(),
            lastMaintenanceKm: form.mileage
        };

        fetch(`${API_BASE_URL}/vehicles`, {
            method: 'POST',
            headers: HEADERS_JSON,
            body: JSON.stringify(payload)
        })
            .then(async res => {
                if (!res.ok) {
                    const errorData = await res.json();
                    if (errorData.message) {
                        const msg = errorData.message.toLowerCase();
                        if (msg.includes('placa')) setErrors(prev => ({ ...prev, licensePlate: errorData.message }));
                        else if (msg.includes('marca')) setErrors(prev => ({ ...prev, brand: errorData.message }));
                        else if (msg.includes('año')) setErrors(prev => ({ ...prev, year: errorData.message }));
                        else if (msg.includes('kilometraje')) setErrors(prev => ({ ...prev, mileage: errorData.message }));

                        throw new Error(errorData.message);
                    }
                    throw new Error("Error al registrar el vehiculo, no puede existir placas duplicadas");
                }
                return res.json();
            })
            .then(data => {
                notificar("Unidad registrada exitosamente", "success");
                recargar();
                setForm({
                    licensePlate: '',
                    brand: '',
                    model: '',
                    year: '',
                    mileage: '',
                    status: 'Available',
                    lastMaintenanceKm: 0,
                    maintenanceIntervalKm: ''
                });
                setErrors({
                    licensePlate: '',
                    brand: '',
                    model: '',
                    year: '',
                    mileage: '',
                    maintenanceIntervalKm: ''
                });
            })
            .catch(error => {
                notificar(error.message, "error");
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };

    // Estilos dinámicos para inputs
    const getInputStyle = (fieldName) => {
        const hasError = !!errors[fieldName];
        const hasValue = form[fieldName] && !hasError;

        // Excepción para mileage si year >= 2026 (opcional)
        const isMileageOptional = fieldName === 'mileage' && form.year >= 2026;

        let borderColor = '#E5E7EB'; // Default gray-200
        if (hasError) borderColor = '#EF4444'; // Red-500
        else if (hasValue && !isMileageOptional) borderColor = '#10B981'; // Emerald-500

        return {
            ...estilos.input,
            borderColor,
            borderWidth: (hasError || (hasValue && !isMileageOptional)) ? '2px' : '1px',
            padding: (hasError || (hasValue && !isMileageOptional)) ? '11px 15px' : '12px 16px',
            textTransform: fieldName === 'licensePlate' || fieldName === 'brand' || fieldName === 'model' ? 'uppercase' : 'none'
        };
    };

    return (
        <div className="fade-in" style={{ ...estilos.formCard, position: 'relative' }}>
            <div style={{ paddingBottom: '25px', borderBottom: '1px solid #F3F4F6', marginBottom: '30px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <div style={{ background: '#EEF2FF', padding: '12px', borderRadius: '12px' }}>
                        <Car size={32} color={THEME.primary} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, color: THEME.text, fontSize: '20px', fontWeight: '700' }}>Vehículo</h3>
                        <p style={{ margin: '2px 0 0', color: THEME.textSoft, fontSize: '14px' }}>Ingrese los datos técnicos de la nueva unidad.</p>
                    </div>
                </div>
            </div>

            <form onSubmit={submit}>
                <div style={estilos.formGrid}>
                    <FormGroup label="PLACA (IDENTIFICADOR)" icon={Tag}>
                        <input
                            ref={placaRef}
                            placeholder="ABC-1234"
                            value={form.licensePlate}
                            onChange={e => {
                                let val = e.target.value.toUpperCase();
                                if (val.length === 3 && form.licensePlate.length === 2) {
                                    val += '-';
                                }
                                handleInputChange('licensePlate', val);
                            }}
                            maxLength={8} // 3 letters + 1 hyphen + 4 numbers
                            onFocus={() => handleFieldFocus('licensePlate')}
                            onBlur={e => validateField('licensePlate', e.target.value)}
                            style={getInputStyle('licensePlate')}
                        />
                        {errors.licensePlate && <ErrorTooltip message={errors.licensePlate} />}
                        {!errors.licensePlate && form.licensePlate && <SuccessMessage message="Formato correcto" />}
                    </FormGroup>

                    <FormGroup label="MARCA" icon={Car}>
                        <input
                            ref={marcaRef}
                            placeholder="HINO, MERCEDES, VOLVO, ETC."
                            value={form.brand}
                            onChange={e => handleInputChange('brand', e.target.value)}
                            onFocus={() => handleFieldFocus('brand')}
                            onBlur={e => validateField('brand', e.target.value)}
                            style={getInputStyle('brand')}
                        />
                        {errors.brand && <ErrorTooltip message={errors.brand} />}
                    </FormGroup>

                    <FormGroup label="MODELO" icon={Car}>
                        <input
                            ref={modeloRef}
                            placeholder="FC9JL7Z, RM1ESSU XS, AK8JRSA, OF, O500, ETC."
                            value={form.model}
                            onChange={e => handleInputChange('model', e.target.value)}
                            onFocus={() => handleFieldFocus('model')}
                            onBlur={e => validateField('model', e.target.value)}
                            style={getInputStyle('model')}
                        />
                        {errors.model && <ErrorTooltip message={errors.model} />}
                    </FormGroup>

                    <FormGroup label="AÑO DE FABRICACIÓN" icon={Calendar}>
                        <input
                            ref={anioRef}
                            type="number"
                            placeholder="Ej: 2023"
                            value={form.year}
                            onChange={e => handleInputChange('year', parseInt(e.target.value) || '')}
                            onFocus={() => handleFieldFocus('year')}
                            onBlur={e => validateField('year', parseInt(e.target.value) || '')}
                            style={getInputStyle('year')}
                        />
                        {errors.year && <ErrorTooltip message={errors.year} />}
                    </FormGroup>

                    <FormGroup label="KILOMETRAJE INICIAL" icon={Activity}>
                        <input
                            ref={kmRef}
                            type="text"
                            placeholder="Ej: 50,000"
                            value={form.mileage ? form.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                            onChange={e => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                if (/^\d*$/.test(rawValue)) {
                                    handleInputChange('mileage', rawValue === '' ? '' : parseFloat(rawValue));
                                }
                            }}
                            onFocus={() => handleFieldFocus('mileage')}
                            onBlur={e => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                validateField('mileage', rawValue === '' ? '' : parseFloat(rawValue));
                            }}
                            style={getInputStyle('mileage')}
                        />
                        {errors.mileage && form.year < 2026 && <ErrorTooltip message={errors.mileage} />}
                    </FormGroup>

                    <FormGroup label="INTERVALO DE SERVICIO (KM)" icon={PenTool}>
                        <input
                            ref={intervaloRef}
                            type="text"
                            placeholder="Ej: 5,000"
                            value={form.maintenanceIntervalKm ? form.maintenanceIntervalKm.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ''}
                            onChange={e => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                if (/^\d*$/.test(rawValue)) {
                                    handleInputChange('maintenanceIntervalKm', rawValue === '' ? '' : parseInt(rawValue));
                                }
                            }}
                            onFocus={() => handleFieldFocus('maintenanceIntervalKm')}
                            onBlur={e => {
                                const rawValue = e.target.value.replace(/,/g, '');
                                validateField('maintenanceIntervalKm', rawValue === '' ? '' : parseInt(rawValue));
                            }}
                            style={getInputStyle('maintenanceIntervalKm')}
                        />
                        {errors.maintenanceIntervalKm && <ErrorTooltip message={errors.maintenanceIntervalKm} />}
                    </FormGroup>

                    <FormGroup label="ESTADO INICIAL" icon={CheckCircle}>
                        <select
                            value={form.status}
                            onChange={e => setForm({ ...form, status: e.target.value })}
                            style={{
                                ...estilos.input,
                                borderColor: form.status === 'Available' ? THEME.success : THEME.danger,
                                borderWidth: '2px',
                                padding: '12px 16px', // Matching other inputs
                                cursor: 'pointer',
                                fontSize: '15px',
                                fontWeight: '500',
                                appearance: 'none', // Remove default arrow to avoid double arrows if custom icon used, or just cleaner look
                                background: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e") right 10px center no-repeat #fdfdfd`,
                                backgroundSize: '20px 20px'
                            }}
                        >
                            <option value="Available">ACTIVO</option>
                            <option value="Maintenance">INACTIVO</option>
                        </select>
                    </FormGroup>
                </div>

                <div style={{ marginTop: '20px', paddingTop: '10px', borderTop: '1px solid #F3F4F6', textAlign: 'right' }}>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        style={{
                            ...estilos.btnPrimary,
                            padding: '14px 40px',
                            fontSize: '15px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px',
                            opacity: isSubmitting ? 0.7 : 1,
                            cursor: isSubmitting ? 'not-allowed' : 'pointer',
                            background: isSubmitting ? '#9ca3af' : THEME.primary
                        }}
                    >
                        {isSubmitting ? 'Guardando...' : 'Guardar Registro'}
                    </button>
                </div>
            </form>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default RegisterView;
