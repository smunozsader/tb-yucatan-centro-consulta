import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext.jsx';

export default function VentanillaLoginModal({ show, onClose, onSuccess }) {
  const { login, user, error } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setLocalError('');
    try {
      await login(email, password);
      setLoading(false);
      onSuccess && onSuccess();
    } catch (err) {
      setLoading(false);
      setLocalError('Credenciales incorrectas o sin permisos.');
    }
  }

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.3)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Acceso a Movilizaciones</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <form onSubmit={handleLogin}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Correo electrónico</label>
                <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label">Contraseña</label>
                <input type="password" className="form-control" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {(localError || error) && <div className="alert alert-danger">{localError || error}</div>}
              <div className="alert alert-info">
                <span className="bi bi-question-circle"></span> Solo los administradores y responsables de Ventanilla pueden acceder a esta sección.
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Accediendo...' : 'Acceder'}</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
