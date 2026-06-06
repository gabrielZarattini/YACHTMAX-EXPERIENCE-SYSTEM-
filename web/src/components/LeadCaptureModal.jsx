import { useState, useEffect, useRef, useCallback } from 'react';
import { registerLead } from '../services/lnx-core-mock';
import { trackCTAClick } from '../services/analytics';

const interestOptions = [
  { value: '', label: 'Selecione seu interesse...' },
  { value: 'ferretti_500', label: 'Ferretti Yachts 500' },
  { value: 'ferretti_670', label: 'Ferretti Yachts 670' },
  { value: 'ferretti_780', label: 'Ferretti Yachts 780' },
  { value: 'riva_56', label: 'Riva 56 Rivale' },
  { value: 'riva_76', label: 'Riva 76 Perseo Super' },
  { value: 'custom_yacht', label: 'Custom Yacht 60ft+' },
  { value: 'portfolio', label: 'Conhecer o portfólio completo' },
];

/**
 * LeadCaptureModal — Premium glassmorphism lead capture form.
 * Supports two interaction types aligned with FR-LNX-01:
 * - 'broker': Direct broker contact
 * - 'cafe': Café & Sea Trial reservation at Marina São Gonçalo
 *
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {Function} props.onClose
 * @param {'broker'|'cafe'} props.type
 */
export default function LeadCaptureModal({ isOpen, onClose, type }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    interest: ''
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success | error
  const [errors, setErrors] = useState({});
  const [response, setResponse] = useState(null);
  const modalRef = useRef(null);
  const nameInputRef = useRef(null);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(() => {
      setStatus('idle');
      setFormData({ name: '', phone: '', email: '', interest: '' });
      setErrors({});
      setResponse(null);
    }, 400);
  }, [onClose]);

  // Auto-focus name input on open
  useEffect(() => {
    if (isOpen && nameInputRef.current) {
      setTimeout(() => nameInputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && status !== 'sending') handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, status, handleClose]);

  const handleBackdropClick = (e) => {
    if (e.target === modalRef.current && status !== 'sending') handleClose();
  };

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    const phoneClean = formData.phone.replace(/[\s\-()]/g, '');
    if (!phoneClean || !/^\+?[\d]{8,15}$/.test(phoneClean)) {
      newErrors.phone = 'Informe um telefone válido';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus('sending');
    trackCTAClick(type === 'broker' ? 'broker_submit' : 'cafe_submit');

    try {
      const result = await registerLead({
        lead_name: formData.name.trim(),
        lead_contact: formData.phone.trim(),
        lead_email: formData.email.trim() || null,
        interaction_type: type === 'broker' ? 'broker_contact' : 'cafe_marina',
        interest: formData.interest || null
      });
      setResponse(result.data);
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  if (!isOpen) return null;

  const title = type === 'broker' ? 'Falar com Broker' : 'Agendar Café na Marina';
  const subtitle = type === 'broker'
    ? 'Conecte-se com nosso time de consultores especializados em luxury yachting.'
    : 'Reserve um momento exclusivo para conhecer seu próximo iate com café e champagne na Marina São Gonçalo.';
  const monoLabel = type === 'broker' ? 'BROKER CONTACT' : 'CAFÉ & SEA TRIAL';

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="lead-modal-overlay"
    >
      <div className="glass-panel lead-modal-content">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="lead-modal-close"
          aria-label="Fechar"
          disabled={status === 'sending'}
        >
          ×
        </button>

        {status === 'success' ? (
          /* =================== SUCCESS STATE =================== */
          <div className="lead-modal-success">
            <div className="lead-modal-check-wrapper">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <circle
                  cx="36" cy="36" r="34"
                  stroke="var(--color-champagne-metal)"
                  strokeWidth="2"
                  className="lead-check-circle"
                />
                <path
                  d="M22 36 L32 46 L50 28"
                  stroke="var(--color-aurora-gold)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lead-check-mark"
                />
              </svg>
            </div>

            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '26px',
              margin: '20px 0 8px',
              color: 'var(--color-pearl-white)'
            }}>
              Recebemos seu contato!
            </h3>

            <p style={{
              color: 'var(--color-sandstone)',
              fontSize: '14px',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Nosso time de consultores premium entrará em contato<br />
              em até <strong style={{ color: 'var(--color-pearl-white)' }}>2 horas</strong>.
            </p>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              justifyContent: 'center',
              padding: '14px 24px',
              background: 'rgba(199, 169, 126, 0.08)',
              borderRadius: 'var(--radius-soft)',
              border: '1px solid rgba(199, 169, 126, 0.2)'
            }}>
              <span className="text-mono" style={{ fontSize: '10px' }}>DESIRE SCORE™</span>
              <span style={{
                color: 'var(--color-aurora-gold)',
                fontWeight: '700',
                fontSize: '22px',
                fontFamily: 'IBM Plex Mono, monospace'
              }}>
                {response?.desire_score || 0}<span style={{ fontSize: '13px', opacity: 0.6 }}>/100</span>
              </span>
            </div>

            <button
              className="btn-yachtmax"
              onClick={handleClose}
              style={{ marginTop: '24px', width: '100%' }}
            >
              Fechar
            </button>
          </div>
        ) : (
          /* =================== FORM STATE =================== */
          <>
            <span className="text-mono" style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '11px'
            }}>
              {monoLabel}
            </span>

            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '26px',
              marginBottom: '8px',
              lineHeight: '1.2',
              color: 'var(--color-pearl-white)'
            }}>
              {title}
            </h3>

            <p style={{
              color: 'var(--color-sandstone)',
              fontSize: '13px',
              lineHeight: '1.6',
              marginBottom: '24px'
            }}>
              {subtitle}
            </p>

            {/* Error Banner */}
            {status === 'error' && (
              <div style={{
                padding: '10px 16px',
                background: 'rgba(220, 53, 69, 0.12)',
                border: '1px solid rgba(220, 53, 69, 0.3)',
                borderRadius: 'var(--radius-sharp)',
                marginBottom: '16px',
                fontSize: '13px',
                color: '#ff6b7a'
              }}>
                Erro ao enviar. Tente novamente.
              </div>
            )}

            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px'
            }}>
              {/* Name */}
              <div>
                <label className="text-mono" style={{ fontSize: '10px', display: 'block', marginBottom: '6px' }}>
                  NOME COMPLETO *
                </label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={formData.name}
                  onChange={handleChange('name')}
                  placeholder="Seu nome"
                  className="lead-modal-input"
                  disabled={status === 'sending'}
                  id="lead-name"
                />
                {errors.name && <span className="lead-modal-error">{errors.name}</span>}
              </div>

              {/* Phone */}
              <div>
                <label className="text-mono" style={{ fontSize: '10px', display: 'block', marginBottom: '6px' }}>
                  TELEFONE / WHATSAPP *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange('phone')}
                  placeholder="+55 (21) 99999-9999"
                  className="lead-modal-input"
                  disabled={status === 'sending'}
                  id="lead-phone"
                />
                {errors.phone && <span className="lead-modal-error">{errors.phone}</span>}
              </div>

              {/* Email (optional) */}
              <div>
                <label className="text-mono" style={{ fontSize: '10px', display: 'block', marginBottom: '6px' }}>
                  E-MAIL (OPCIONAL)
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  placeholder="seu@email.com"
                  className="lead-modal-input"
                  disabled={status === 'sending'}
                  id="lead-email"
                />
                {errors.email && <span className="lead-modal-error">{errors.email}</span>}
              </div>

              {/* Interest */}
              <div>
                <label className="text-mono" style={{ fontSize: '10px', display: 'block', marginBottom: '6px' }}>
                  EMBARCAÇÃO DE INTERESSE
                </label>
                <select
                  value={formData.interest}
                  onChange={handleChange('interest')}
                  className="lead-modal-select"
                  disabled={status === 'sending'}
                  id="lead-interest"
                >
                  {interestOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="btn-yachtmax"
                disabled={status === 'sending'}
                id="lead-submit"
                style={{
                  marginTop: '8px',
                  width: '100%',
                  background: status === 'sending'
                    ? 'rgba(199, 169, 126, 0.3)'
                    : 'var(--color-champagne-metal)',
                  color: 'var(--color-midnight-ocean)',
                  minHeight: '48px',
                  position: 'relative'
                }}
              >
                {status === 'sending' ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="lead-spinner" />
                    Enviando...
                  </span>
                ) : (
                  type === 'broker' ? 'Conectar com Broker' : 'Reservar Experiência'
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
