import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ChooseUser() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const existingUser = localStorage.getItem('username');
    if (existingUser) {
      router.replace('/chat');
    }
  }, []);

  const selectUser = (user) => {
    setSelectedUser(user);
    setTimeout(() => {
      localStorage.setItem('username', user);
      router.push('/chat');
    }, 300);
  };

  return (
    <div className="user-select-container">
      <div className="user-select-card">
        <div className="header-section">
          <div className="avatar-icon">👥</div>
          <h1 className="title">Choose Your Identity</h1>
          <p className="subtitle">Select your user profile to continue</p>
        </div>

        <div className="users-grid">
          <div 
            className={`user-card ${selectedUser === 'user1' ? 'selected' : ''}`}
            onClick={() => selectUser('user1')}
          >
            <div className="user-avatar">
              <span className="avatar-emoji">👨‍💼</span>
            </div>
            <div className="user-info">
              <h3 className="user-name">Salman</h3>
              <p className="user-role">Primary User</p>
            </div>
            <div className="user-badge">User 1</div>
          </div>

          <div 
            className={`user-card ${selectedUser === 'user2' ? 'selected' : ''}`}
            onClick={() => selectUser('user2')}
          >
            <div className="user-avatar">
              <span className="avatar-emoji">👩‍💼</span>
            </div>
            <div className="user-info">
              <h3 className="user-name">She</h3>
              <p className="user-role">Secondary User</p>
            </div>
            <div className="user-badge">User 2</div>
          </div>
        </div>

        <div className="footer-note">
          <p>🔒 Your selection is secure and private</p>
        </div>
      </div>

      <style jsx>{`
        .user-select-container {
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

        .user-select-container::before {
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

        .user-select-card {
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
          max-width: 500px;
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

        .header-section {
          margin-bottom: 40px;
        }

        .avatar-icon {
          font-size: 48px;
          margin-bottom: 20px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .title {
          color: white;
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #3b99fc, #4ecdc4);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 16px;
          margin: 0;
        }

        .users-grid {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 30px;
        }

        .user-card {
          display: flex;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .user-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          transition: left 0.5s ease;
        }

        .user-card:hover::before {
          left: 100%;
        }

        .user-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
          border-color: rgba(59, 153, 252, 0.5);
        }

        .user-card.selected {
          background: linear-gradient(135deg, rgba(59, 153, 252, 0.2), rgba(78, 205, 196, 0.2));
          border-color: #3b99fc;
          box-shadow: 0 0 30px rgba(59, 153, 252, 0.3);
          animation: selectedPulse 2s infinite;
        }

        @keyframes selectedPulse {
          0%, 100% { box-shadow: 0 0 30px rgba(59, 153, 252, 0.3); }
          50% { box-shadow: 0 0 40px rgba(59, 153, 252, 0.5); }
        }

        .user-avatar {
          margin-right: 20px;
          position: relative;
        }

        .avatar-emoji {
          font-size: 40px;
          display: block;
          padding: 10px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .user-info {
          flex: 1;
          text-align: left;
        }

        .user-name {
          color: white;
          font-size: 20px;
          font-weight: 600;
          margin: 0 0 5px 0;
        }

        .user-role {
          color: rgba(255, 255, 255, 0.7);
          font-size: 14px;
          margin: 0;
        }

        .user-badge {
          background: linear-gradient(135deg, #3b99fc, #4ecdc4);
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .footer-note {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
        }

        .footer-note p {
          color: rgba(255, 255, 255, 0.6);
          font-size: 12px;
          margin: 0;
        }

        @media (max-width: 480px) {
          .user-select-card {
            padding: 30px 20px;
            margin: 10px;
          }
          
          .title {
            font-size: 24px;
          }
          
          .avatar-icon {
            font-size: 40px;
          }
          
          .user-card {
            padding: 15px;
          }
          
          .avatar-emoji {
            font-size: 32px;
            padding: 8px;
          }
          
          .user-name {
            font-size: 18px;
          }
          
          .user-avatar {
            margin-right: 15px;
          }
        }
      `}</style>
    </div>
  );
}
