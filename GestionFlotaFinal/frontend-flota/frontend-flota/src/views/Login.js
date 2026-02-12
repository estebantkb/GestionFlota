import React, { useState, useRef } from 'react';
import { estilos, THEME } from '../config/theme';
import { API_BASE_URL, HEADERS_JSON } from '../config/utils';
import { User, Lock, ArrowRight, Shield } from 'lucide-react';

const Login = ({ setUser, showToast }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({ username: '', password: '' });

    const userRef = useRef();
    const passRef = useRef();

    const validateField = (field, value) => {
        let error = '';
        if (field === 'username') {
            if (!value.trim()) error = 'El usuario es obligatorio';
            else if (value.length < 3) error = 'El usuario debe tener al menos 3 caracteres';
            else if (/\s/.test(value)) error = 'El usuario no debe tener espacios';
        }
        if (field === 'password') {
            if (!value) error = 'La contraseña es obligatoria';
            else if (value.length < 4) error = 'La contraseña debe tener al menos 4 caracteres';
        }
        setErrors(prev => ({ ...prev, [field]: error }));
        return error === '';
    };

    const handleLogin = (e) => {
        e.preventDefault();

        const validUser = validateField('username', username);
        const validPass = validateField('password', password);

        if (!validUser) {
            if (userRef.current) userRef.current.focus();
            return;
        }
        if (!validPass) {
            if (passRef.current) passRef.current.focus();
            return;
        }

        setLoading(true);
        const credenciales = { username, password };

        fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: HEADERS_JSON,
            body: JSON.stringify(credenciales)
        })
            .then(res => {
                if (!res.ok) throw new Error("Credenciales incorrectas");
                return res.json();
            })
            .then(data => {
                if (data.status === "ok") {
                    setUser({ nombre: username, role: data.role });
                    showToast(`Bienvenido, ${username}`, 'info');
                } else {
                    showToast("Usuario o contraseña incorrectos", 'error');
                }
            })
            .catch((err) => showToast(err.message, 'error'))
            .finally(() => setLoading(false));
    };

    return (
        <div style={estilos.loginCard}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <div style={{ width: '60px', height: '60px', background: THEME.primary, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 20px rgba(79, 70, 229, 0.3)' }}>
                    <Shield size={32} color="white" />
                </div>
            </div>
            <div style={estilos.brandLogo}>FLOTA MANAGER</div>
            <p style={{ color: THEME.textSoft, marginBottom: '40px', fontSize: '15px' }}>Identifícate para acceder al sistema</p>

            <form onSubmit={handleLogin} autoComplete="off">
                <div style={{ position: 'relative', marginBottom: errors.username ? '5px' : '20px' }}>
                    <User size={20} color={errors.username ? THEME.danger : THEME.textSoft} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        ref={userRef}
                        type="text"
                        placeholder="Usuario"
                        value={username}
                        onChange={e => { setUsername(e.target.value); validateField('username', e.target.value); }}
                        onBlur={e => validateField('username', e.target.value)}
                        style={{
                            ...estilos.input,
                            paddingLeft: '45px',
                            borderColor: errors.username ? THEME.danger : estilos.input.borderColor
                        }}
                    />
                </div>
                {errors.username && (
                    <div style={{
                        color: THEME.danger,
                        fontSize: '12px',
                        marginBottom: '15px',
                        marginLeft: '5px',
                        fontWeight: 500
                    }}>
                        {errors.username}
                    </div>
                )}

                <div style={{ position: 'relative', marginBottom: errors.password ? '5px' : '30px' }}>
                    <Lock size={20} color={errors.password ? THEME.danger : THEME.textSoft} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        ref={passRef}
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={e => { setPassword(e.target.value); validateField('password', e.target.value); }}
                        onBlur={e => validateField('password', e.target.value)}
                        style={{
                            ...estilos.input,
                            paddingLeft: '45px',
                            borderColor: errors.password ? THEME.danger : estilos.input.borderColor
                        }}
                    />
                </div>
                {errors.password && (
                    <div style={{
                        color: THEME.danger,
                        fontSize: '12px',
                        marginBottom: '25px',
                        marginLeft: '5px',
                        fontWeight: 500
                    }}>
                        {errors.password}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading || !!errors.username || !!errors.password}
                    style={{
                        ...estilos.btnPrimaryFull,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        opacity: (loading || !!errors.username || !!errors.password) ? 0.7 : 1,
                        cursor: (loading || !!errors.username || !!errors.password) ? 'not-allowed' : 'pointer'
                    }}>
                    {loading ? 'Validando...' : 'INGRESAR'} {!loading && <ArrowRight size={18} />}
                </button>
            </form>

            <div style={{ marginTop: '30px', fontSize: '12px', color: THEME.textSoft }}>
                Sistema de Control v5.0
            </div>
        </div>
    );
};

export default Login;
