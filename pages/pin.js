import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PinLogin() {
  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [showError, setShowError] = useState(false);
  const router = useRouter();

  // Redirect to camera page when app loses or regains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        localStorage.removeItem('verified');
      } else {
        router.push('/');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  const handleLogin = () => {
    if (isLocked) return;

    if (pin === '7520') {
      localStorage.setItem('username', 'user1');
      router.push('/chat');
    } else if (pin === '0212') {
      localStorage.setItem('username', 'user2');
      router.push('/chat');
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setShowError(true);
      setPin('');
      
      if (newAttempts >= 3) {
        setIsLocked(true);
        setTimeout(() => {
          setIsLocked(false);
          setAttempts(0);
        }, 30000); // 30 second lockout
      }

      setTimeout(() => setShowError(false), 3000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const handlePinChange = (e) => {
    if (isLocked) return;
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setPin(value);
  };

  return (
    <div className="pin-container">
      <div className="pin-card">
        <div className="pin-header">
          <div className="security-icon">🔐</div>
          <h1 className="pin-title">Secure Access</h1>
          <p className="pin-subtitle">Enter your 4-digit PIN to continue</p>
        </div>

        <div className="pin-input-section">
          <div className="pin-dots">
            {[0, 1, 2, 3].map(index => (
              <div 
                key={index}
                className={`pin-dot ${index < pin.length ? 'filled' : ''}`}
              />
            ))}
          </div>
          
          <input
            type="password"
            value={pin}
            onChange={handlePinChange}
            onKeyPress={handleKeyPress}
            placeholder="••••"
            maxLength={4}
            className="pin-input"
            disabled={isLocked}
            autoFocus
          />
        </div>

        {showError && (
          <div className="error-message">
            ❌ Incorrect PIN. {3 - attempts} attempts remaining.
          </div>
        )}

        {isLocked && (
          <div className="locked-message">
            🔒 Too many failed attempts. Please wait 30 seconds.
          </div>
        )}

        <button 
          onClick={handleLogin} 
          className={`login-button ${isLocked ? 'disabled' : ''}`}
          disabled={isLocked || pin.length !== 4}
        >
          {isLocked ? 'Locked' : 'Unlock'}
        </button>

        <div className="pin-footer">
          <p className="security-note">
            🛡️ Your PIN is encrypted and secure
          </p>
        </div>
      </div>

      <style jsx>{`
        .pin-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(-45deg, #0f0f0f, #1a1a40, #1a0033, #0f0f0f);
          background-size: 400% 400%;
          animation: gradientMove 15s ease infinite;
          padding: 20px;
          position: relative;
        }

        .pin-container::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 20% 80%, rgba(59, 153, 252, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 20%, rgba(255, 107, 107, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .pin-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.6s ease;
          position: relative;
          z-index: 1;
          max-width: 400px;
          width: 100%;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .pin-header {
          margin-bottom: 40px;
        }

        .security-icon {
          font-size: 48px;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .pin-title {
          color: white;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #3b99fc, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .pin-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          margin: 0;
        }

        .pin-input-section {
          margin-bottom: 30px;
        }

        .pin-dots {
          display: flex;
          justify-content: center;
          gap: 15px;
          margin-bottom: 20px;
        }

        .pin-dot {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.3);
          transition: all 0.3s ease;
        }

        .pin-dot.filled {
          background: linear-gradient(135deg, #3b99fc, #4ecdc4);
          border-color: #3b99fc;
          box-shadow: 0 0 15px rgba(59, 153, 252, 0.5);
          animation: dotFill 0.3s ease;
        }

        @keyframes dotFill {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .pin-input {
          width: 100%;
          padding: 15px 20px;
          font-size: 24px;
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 12px;
          color: white;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.3s ease;
          letter-spacing: 8px;
        }

        .pin-input:focus {
          outline: none;
          border-color: #3b99fc;
          box-shadow: 0 0 20px rgba(59, 153, 252, 0.3);
          background: rgba(255, 255, 255, 0.15);
        }

        .pin-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 4px;
        }

        .pin-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          color: #ff6b6b;
          background: rgba(255, 107, 107, 0.1);
          border: 1px solid rgba(255, 107, 107, 0.3);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          animation: shake 0.5s ease;
        }

        .locked-message {
          color: #ffa726;
          background: rgba(255, 167, 38, 0.1);
          border: 1px solid rgba(255, 167, 38, 0.3);
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 20px;
          font-size: 14px;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        .login-button {
          width: 100%;
          padding: 15px 20px;
          font-size: 18px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #3b99fc, #4ecdc4);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 153, 252, 0.3);
          margin-bottom: 20px;
        }

        .login-button:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 153, 252, 0.4);
        }

        .login-button:active:not(.disabled) {
          transform: translateY(0);
        }

        .login-button.disabled {
          background: linear-gradient(135deg, #666, #888);
          cursor: not-allowed;
          box-shadow: none;
        }

        .login-button:disabled {
          opacity: 0.6;
        }

        .pin-footer {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
        }

        .security-note {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          margin: 0;
        }

        @media (max-width: 480px) {
          .pin-card {
            padding: 30px 20px;
            margin: 10px;
          }
          
          .pin-title {
            font-size: 24px;
          }
          
          .security-icon {
            font-size: 40px;
          }
          
          .pin-input {
            font-size: 20px;
            letter-spacing: 6px;
          }
        }
      `}</style>
    </div>
  );
}
