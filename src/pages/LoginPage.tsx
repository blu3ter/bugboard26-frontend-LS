import React, { useState } from 'react';
import type { LoginRequestDto } from '../types';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginRequestDto>({
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulazione del login per mostrare l'effetto interattivo al frontend
    console.log('Tentativo di login con DTO:', formData);
    setTimeout(() => {
      alert(`Login effettuato per: ${formData.email}`);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Colonna Sinistra: Form di Autenticazione */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <div className="logo-container">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBu0P_fmIrOntSJlHKz13Kr9ZOEwKtlBxmfSbXcQjg3zf3l16TXL812tbbFI2fuSyLCVNIo9oEEWfWdff7TnnRxvFmnDE_BoHYI8BE4hGmdbazmu2SMmHPQ5aEL5lqSBAFO-7errwHAt4IdVraD5rN0ZvN-PaRnq30DsFg7hBlr0E8SCPbh_gBi1NDEcPlZFAtwkIQjA8T1gQ_7izYTJKx-8m6GW3-Vd1zo_x2D5N4njYK61fUm54ucSEEmyIxaVyCDWJ_fViUxZ34"
                alt="Bugboard Logo"
                className="logo-img"
              />
            </div>
            <h1 className="login-title">bugboard26</h1>
            <p className="login-subtitle">
              Welcome back. Enter your aziendal credentials to access your account.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Username or Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="nome@azienda.it"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="form-input"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="submit-btn"
                >
                  {isSubmitting ? 'Accesso in corso...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Colonna Destra: Griglia Geometrica Bauhaus */}
        <div className="bauhaus-art-section">
          <div className="bauhaus-grid">
            <div className="bg-red rounded-br-full"></div>
            <div className="bg-black rounded-bl-full"></div>
            <div className="bg-blue rounded-bl-full"></div>
            <div className="bg-yellow rounded-tr-full"></div>
            
            <div className="stripes-container">
              <div className="stripe"></div>
              <div className="stripe"></div>
              <div className="stripe"></div>
              <div className="stripe"></div>
            </div>
            
            <div className="bg-red rounded-tl-full"></div>
            <div className="bg-black rounded-br-full"></div>
            <div className="bg-yellow rounded-bl-full"></div>
            <div className="bg-black rounded-bl-full"></div>
            <div className="bg-blue rounded-tr-full"></div>
            <div className="bg-red rounded-tl-full"></div>
            <div className="bg-yellow rounded-tl-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
