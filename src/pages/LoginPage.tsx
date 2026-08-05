import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginRequestDto } from '../types';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
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

  /*in questo metodo si raggruppano gli attributi email e password in una variabile "formdata"
  e di inviarla al server tramite una request post all'indirizzo specificato, ovviamwente in formato JSON*/
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:8080/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        // Se il backend risponde con 401, stampiamo il messaggio
        const errorText = await response.text();
        throw new Error(errorText || 'Email o password non corretti');
      }

      const data = await response.json(); // Il LoginResponseDto

      // Salva il token in sessionStorage
      sessionStorage.setItem('bugboard_token', data.token);

      // Salva i dati utente se servono all'interfaccia (opzionale)
      sessionStorage.setItem('bugboard_user', JSON.stringify({
        email: data.email,
        name: data.name,
        role: data.role
      }));

      alert(`Benvenuto ${data.name || data.email}!`);

      // Reindirizza l'utente alla schermata con le issues
      navigate('/dashboard/my-issues');

    } catch (error: any) {
      alert(error.message || 'Errore di connessione al server');
    } finally {
      setIsSubmitting(false);
    }
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
