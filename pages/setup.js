// pages/setup.js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Setup() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initializing...');

  useEffect(() => {
    const steps = [
      { text: 'Initializing secure connection...', duration: 800 },
      { text: 'Verifying user credentials...', duration: 600 },
      { text: 'Setting up encryption...', duration: 700 },
      { text: 'Preparing chat environment...', duration: 500 },
      { text: 'Almost ready...', duration: 400 }
    ];

    let currentStepIndex = 0;
    let currentProgress = 0;

    const progressInterval = setInterval(() => {
      currentProgress += 2;
      setProgress(currentProgress);

      if (currentProgress >= 100) {
        clearInterval(progressInterval);
        setTimeout(() => {
          router.push('/pin');
        }, 500);
      }
    }, 50);

    const stepInterval = setInterval(() => {
      if (currentStepIndex < steps.length) {
        setCurrentStep(steps[currentStepIndex].text);
        currentStepIndex++;
      } else {
        clearInterval(stepInterval);
      }
    }, 500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(stepInterval);
    };
  }, [router]);

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-icon">
          <div className="gear-icon">⚙️</div>
        </div>
        
        <h1 className="setup-title">Setting Up</h1>
        <p className="setup-subtitle">Preparing your secure chat environment</p>
        
        <div className="progress-section">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">{progress}%</div>
        </div>
        
        <div className="current-step">
          {currentStep}
        </div>
        
        <div className="setup-features">
          <div className="feature-item">
            <span className="feature-icon">🔐</span>
            <span>End-to-end encryption</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🚀</span>
            <span>Real-time messaging</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span>Cross-platform sync</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        .setup-container {
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

        .setup-container::before {
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

        .setup-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 50px 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.6s ease;
          position: relative;
          z-index: 1;
          max-width: 450px;
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

        .setup-icon {
          margin-bottom: 30px;
        }

        .gear-icon {
          font-size: 64px;
          animation: rotate 3s linear infinite;
          display: inline-block;
        }

        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .setup-title {
          color: white;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #3b99fc, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .setup-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          margin-bottom: 40px;
        }

        .progress-section {
          margin-bottom: 30px;
        }

        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 10px;
          position: relative;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #3b99fc, #4ecdc4);
          border-radius: 4px;
          transition: width 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .progress-text {
          color: white;
          font-size: 18px;
          font-weight: 600;
        }

        .current-step {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          margin-bottom: 40px;
          min-height: 24px;
          animation: fadeIn 0.5s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .setup-features {
          display: flex;
          flex-direction: column;
          gap: 15px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 30px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          color: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          padding: 8px 0;
        }

        .feature-icon {
          font-size: 18px;
          width: 24px;
          text-align: center;
        }

        @media (max-width: 480px) {
          .setup-card {
            padding: 40px 30px;
            margin: 10px;
          }
          
          .setup-title {
            font-size: 28px;
          }
          
          .gear-icon {
            font-size: 56px;
          }
          
          .setup-features {
            gap: 12px;
          }
        }
      `}</style>
    </div>
  );
}
