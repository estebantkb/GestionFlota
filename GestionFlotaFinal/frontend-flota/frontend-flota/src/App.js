// src/App.js
import React, { useState } from 'react';
import './App.css'; 
import { estilos } from './config/theme';
import { ToastNotification } from './components/UI';
import Login from './views/Login';
import SistemaFlota from './layouts/SistemaFlota';

function App() {
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: '', type: '' });

  const showToast = (msg, type = 'success') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast({ show: false, msg: '', type: '' }), 4000);
  };

  if (!user) {
    return (
      <div style={estilos.loginWrapper}>
        {toast.show && <ToastNotification msg={toast.msg} type={toast.type} />}
        <Login setUser={setUser} showToast={showToast} />
      </div>
    );
  }

  return (
    <div style={estilos.appLayout}>
      {toast.show && <ToastNotification msg={toast.msg} type={toast.type} />}
      <SistemaFlota user={user} onLogout={() => setUser(null)} notificar={showToast} /> 
    </div>
  );
}

export default App;