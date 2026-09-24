import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginRequestDto } from '../types';
import logoImg from '../assets/logobb26.png';
import titleImg from '../assets/title BugBoard26.png';
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
      {/* Sfondo animato con gli hashtag */}
      <div className="floating-tags-container">
        <span className="floating-tag tag-backend">#backend</span>
        <span className="floating-tag tag-frontend">#frontend</span>
        <span className="floating-tag tag-bug">#bug</span>
        <span className="floating-tag tag-question">#question</span>
        <span className="floating-tag tag-fast">#fast</span>
        <span className="floating-tag tag-feature">#feature</span>
        <span className="floating-tag tag-chill">#chill</span>
        <span className="floating-tag tag-dangerous">#dangerous</span>
        <span className="floating-tag tag-open">#open</span>
        <span className="floating-tag tag-in-progress">#in progress</span>
        <span className="floating-tag tag-closed">#closed</span>
        <span className="floating-tag tag-uiux">#ui/ux</span>
        <span className="floating-tag tag-devops">#devops</span>
        <span className="floating-tag tag-meeting">#meeting</span>
        <span className="floating-tag tag-hotfix">#hotfix</span>
        <span className="floating-tag tag-urgent">#urgent</span>
        <span className="floating-tag tag-backend-2">#backend</span>
        <span className="floating-tag tag-frontend-2">#frontend</span>
        <span className="floating-tag tag-bug-2">#bug</span>
        <span className="floating-tag tag-feature-2">#feature</span>
        <span className="floating-tag tag-fast-2">#fast</span>
      </div>

      <div className="login-card">
        {/* Colonna Sinistra: Form di Autenticazione */}
        <div className="login-form-section">
          <div className="login-form-wrapper">
            <h1 className="login-title">
              <img
                src={titleImg}
                alt="BugBoard26"
                className="login-title-img"
              />
            </h1>
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

        {/* Colonna Destra: Logo BB26 Hero */}
        <div className="login-hero-section">
          <div className="login-hero-content">
            <img
              src={logoImg}
              alt="Bugboard 26"
              className="login-hero-logo"
            />
            <p className="login-hero-tagline">
              The collaborative platform to track issues, share feedback, and streamline your team's workflow in one place.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
