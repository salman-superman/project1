'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import TimerIcon from '@mui/icons-material/Timer';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function CameraScreen() {
  const videoRef = useRef(null);
  const router = useRouter();
  const [mode, setMode] = useState('photo');
  const [facing, setFacing] = useState('user');
  const [clicks, setClicks] = useState(0);
  const [lastClick, setLastClick] = useState(0);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [focusPoint, setFocusPoint] = useState(null);

  // Ask user if not already set
  useEffect(() => {
    const existingUser = localStorage.getItem('username');
    if (!existingUser) {
      setShowUserPopup(true);
    }
  }, []);

  // Access camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facing } })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(err => console.error('Camera error:', err));
  }, [facing]);

  // Triple tap handler
  function tripleTap() {
    const now = Date.now();
    if (now - lastClick < 800) {
      const next = clicks + 1;
      if (next >= 3) {
        router.push('/pin');
        setClicks(0);
      } else {
        setClicks(next);
      }
    } else {
      setClicks(1);
    }
    setLastClick(now);
  }

  // Ask user1/user2
  function chooseUser(user) {
    localStorage.setItem('username', user);
    setShowUserPopup(false);
  }

  // Handle focus tap
  const handleFocusTap = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setFocusPoint({ x, y });
    setTimeout(() => setFocusPoint(null), 2000);
  };

  // Handle shutter click
  const handleShutter = () => {
    if (mode === 'video') {
      setIsRecording(!isRecording);
    } else {
      // Photo capture logic would go here
      console.log('Photo captured!');
    }
  };

  return (
    <div className="camera-container">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className="camera-video"
        onClick={handleFocusTap}
      />
      <div className="camera-grid">
        <div className="camera-grid-line"></div>
        <div className="camera-grid-line"></div>
        <div className="camera-grid-line"></div>
        <div className="camera-grid-line"></div>
        <div className="camera-grid-line"></div>
        <div className="camera-grid-line"></div>
      </div>

      {/* Focus indicator */}
      {focusPoint && (
        <div 
          className="focus-indicator"
          style={{
            left: focusPoint.x - 25,
            top: focusPoint.y - 25,
          }}
        />
      )}

      {/* Top Bar */}
      <div className="camera-top-bar">
        <div className="camera-control-icon">
          <FlashOnIcon />
          <span className="control-label">Flash</span>
        </div>
        <div className="camera-control-icon">
          <TimerIcon />
          <span className="control-label">Timer</span>
        </div>
        <div className="camera-status">
        </div>
      </div>


      {/* Mode Selector */}
      <div className="mode-selector">
        {['photo', 'video', 'portrait', 'night', 'slow-mo'].map(m => (
          <div 
            key={m}
            className={`mode-option ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}
          >
            {m.toUpperCase()}
          </div>
        ))}
      </div>

      {/* Camera Controls */}
      <div className="camera-controls">
        <div className="last-photo-preview">
          <div className="photo-placeholder" />
          <span className="gallery-label">Gallery</span>
        </div>
        
        <div 
          className={`shutter-button ${mode === 'video' ? 'video-mode' : ''} ${isRecording ? 'recording' : ''}`}
          onClick={handleShutter}
        >
          {mode === 'video' && isRecording && <FiberManualRecordIcon />}
        </div>
        
        <div 
          onClick={() => setFacing(facing === 'user' ? 'environment' : 'user')}
          className="flip-camera-btn-bottom"
        >
          <FlipCameraAndroidIcon fontSize="large" />
          <span className="control-label">Flip</span>
        </div>
      </div>

      {/* Hamburger Menu */}
      <div onClick={tripleTap} className="hamburger-menu">
        <div className="hamburger-line" />
        <div className="hamburger-line" />
        <div className="hamburger-line" />
      </div>

      {/* User Selection Popup */}
      {showUserPopup && (
        <div className="user-popup-overlay">
          <div className="user-popup-content">
            <h2 className="user-popup-title">Who are you?</h2>
            <button onClick={() => chooseUser('user1')} className="user-select-btn">
              👨‍💼 Salman
            </button>
            <button onClick={() => chooseUser('user2')} className="user-select-btn">
              👩‍💼 She
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .camera-container {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: relative;
          background: black;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .camera-video {
          width: 100vw;
          height: 100vh;
          object-fit: cover;
          display: block;
          position: relative;
        }

        .camera-grid {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(3, 1fr);
          gap: 1px;
          pointer-events: none;
          z-index: 5;
        }

        .camera-grid-line {
          border: 0.5px solid rgba(255, 255, 255, 0.3);
        }

        .focus-indicator {
          position: absolute;
          width: 50px;
          height: 50px;
          border: 2px solid #3b99fc;
          border-radius: 50%;
          pointer-events: none;
          animation: focusPulse 2s ease-out;
          z-index: 10;
        }

        @keyframes focusPulse {
          0% {
            transform: scale(1.5);
            opacity: 0;
          }
          50% {
            transform: scale(1);
            opacity: 1;
          }
          100% {
            transform: scale(0.8);
            opacity: 0;
          }
        }

        .camera-top-bar {
          position: absolute;
          top: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 25px;
          background: linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%);
          z-index: 20;
        }

        .camera-control-icon {
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .camera-control-icon:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .control-label {
          font-size: 10px;
          margin-top: 2px;
          color: white;
        }

        .camera-status {
          display: flex;
          align-items: center;
          gap: 8px;
          color: white;
          font-size: 12px;
          font-weight: 500;
        }

        .battery-icon {
          font-size: 14px;
        }

        .recording-indicator {
          width: 12px;
          height: 12px;
          background: #ff4444;
          border-radius: 50%;
          animation: recordingPulse 2s infinite;
          margin-left: 10px;
        }

        @keyframes recordingPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .flip-camera-btn-bottom {
          color: white;
          cursor: pointer;
          padding: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          z-index: 20;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .flip-camera-btn-bottom:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1) rotate(180deg);
        }

        .mode-selector {
          position: absolute;
          bottom: 160px;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 30px;
          z-index: 20;
          overflow-x: auto;
          padding: 0 10px;
        }

        .mode-option {
          color: white;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px 16px;
          border-radius: 20px;
          transition: all 0.3s ease;
          opacity: 0.6;
        }

        .mode-option.active {
          opacity: 1;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 4px 15px rgba(59, 153, 252, 0.3);
        }

        .mode-option:hover {
          opacity: 1;
          transform: translateY(-2px);
        }

        .camera-controls {
          position: absolute;
          bottom: 70px;
          width: 100%;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0 30px;
          z-index: 20;
        }

        .last-photo-preview {
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          border: 2px solid rgba(255, 255, 255, 0.3);
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .last-photo-preview:hover {
          transform: scale(1.1);
          border-color: #3b99fc;
        }

        .photo-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, #333, #555);
          background-image: url('/placeholder-photo.jpg');
          background-size: cover;
          background-position: center;
        }

        .gallery-label {
          font-size: 10px;
          color: white;
          margin-top: 2px;
        }

        .shutter-button {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: white;
          border: 6px solid rgba(255, 255, 255, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .shutter-button:hover {
          transform: scale(1.1);
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
        }

        .shutter-button.video-mode {
          background: #ff4444;
        }

        .shutter-button.recording {
          animation: recordingPulse 1s infinite;
        }

        .shutter-button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: all 0.3s ease;
        }

        .shutter-button:active::before {
          width: 100%;
          height: 100%;
        }

        .camera-gallery-icon {
          color: white;
          cursor: pointer;
          padding: 12px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .zoom-label {
          font-size: 10px;
          color: white;
          margin-top: 2px;
        }

        .camera-gallery-icon:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: scale(1.1);
        }

        .hamburger-menu {
          position: absolute;
          top: 25px;
          right: 20px;
          width: 35px;
          height: 30px;
          cursor: pointer;
          z-index: 30;
          padding: 5px;
        }

        .hamburger-line {
          height: 3px;
          background: white;
          margin: 5px 0;
          border-radius: 2px;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .hamburger-menu:hover .hamburger-line {
          background: #3b99fc;
          box-shadow: 0 0 10px rgba(59, 153, 252, 0.5);
        }

        .user-popup-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          animation: fadeIn 0.3s ease;
        }

        .user-popup-content {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 20px;
          padding: 40px;
          text-align: center;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease;
        }

        .user-popup-title {
          color: white;
          margin-bottom: 30px;
          font-size: 24px;
          font-weight: 600;
        }

        .user-select-btn {
          display: block;
          width: 100%;
          padding: 15px 25px;
          font-size: 18px;
          margin: 15px 0;
          cursor: pointer;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #3b99fc, #4ecdc4);
          color: white;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(59, 153, 252, 0.3);
        }

        .user-select-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 153, 252, 0.4);
        }

        .user-select-btn:nth-child(3) {
          background: linear-gradient(135deg, #ff6b6b, #ff8a80);
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .user-select-btn:nth-child(3):hover {
          box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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

        @media (max-width: 768px) {
          .camera-container {
            width: 100vw;
            height: 100vh;
            overflow: hidden;
          }
          
          .camera-video {
            width: 100vw;
            height: 100vh;
            object-fit: cover;
          }
          
          .camera-top-bar {
            padding: 8px 15px;
            font-size: 12px;
            justify-content: space-between;
          }
          
          .mode-selector {
            gap: 15px;
            bottom: 120px;
            justify-content: center;
            overflow-x: auto;
          }
          
          .mode-option {
            font-size: 12px;
            padding: 5px 10px;
          }
          
          .camera-controls {
            bottom: 40px;
            padding: 0 15px;
          }
          
          .shutter-button {
            width: 60px;
            height: 60px;
          }
          
          .user-popup-content {
            margin: 15px;
            padding: 20px;
            font-size: 14px;
          }
          
          .hamburger-menu {
            top: 20px;
            right: 15px;
            width: 30px;
            height: 25px;
          }
          
          .flip-camera-btn {
            top: 60px;
            right: 15px;
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
}

const btnStyle = {
  padding: '10px 20px',
  fontSize: '16px',
  margin: '10px',
  cursor: 'pointer',
  borderRadius: '8px'
};
