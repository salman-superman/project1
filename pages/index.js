'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import TimerIcon from '@mui/icons-material/Timer';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';

export default function CameraScreen() {
  const videoRef = useRef(null);
  const router = useRouter();
  const [mode, setMode] = useState('photo');
  const [clicks, setClicks] = useState(0);
  const [lastClick, setLastClick] = useState(0);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [focusPoint, setFocusPoint] = useState(null);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front, 'environment' for back
  const [secretDrawingMode, setSecretDrawingMode] = useState(false);
  const [drawingPath, setDrawingPath] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTimer, setDrawingTimer] = useState(null);

  // Ask user if not already set
  useEffect(() => {
    const existingUser = localStorage.getItem('username');
    if (!existingUser) {
      setShowUserPopup(true);
    }
  }, []);

  // Access camera
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facingMode } })
      .then(stream => {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      })
      .catch(err => console.error('Camera error:', err));
  }, [facingMode]);

  // Triple tap handler
  function tripleTap() {
    const now = Date.now();
    if (now - lastClick < 800) {
      const next = clicks + 1;
      if (next >= 3) {
        // Activate secret drawing mode (invisible)
        setSecretDrawingMode(true);
        startDrawingTimer();
        setClicks(0);
      } else {
        setClicks(next);
      }
    } else {
      setClicks(1);
    }
    setLastClick(now);
  }

  // Start drawing timer (30 seconds for secret drawing)
  function startDrawingTimer() {
    const timer = setTimeout(() => {
      setSecretDrawingMode(false);
      setDrawingPath([]);
    }, 30000);
    setDrawingTimer(timer);
  }

  // Handle secret drawing start
  function handleSecretDrawStart(e) {
    if (!secretDrawingMode) return;
    setIsDrawing(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    setDrawingPath([{ x, y }]);
  }

  // Handle secret drawing move
  function handleSecretDrawMove(e) {
    if (!secretDrawingMode || !isDrawing) return;
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;
    setDrawingPath(prev => [...prev, { x, y }]);
  }

  // Handle secret drawing end
  function handleSecretDrawEnd() {
    if (!secretDrawingMode) return;
    setIsDrawing(false);
    // Check if drawn pattern resembles a triangle
    if (checkTrianglePattern(drawingPath)) {
      clearTimeout(drawingTimer);
      setSecretDrawingMode(false);
      setDrawingPath([]);
      router.push('/pin');
    }
  }

  // Triangle pattern recognition
  function checkTrianglePattern(path) {
    // Require minimum drawing points
    if (path.length < 30) return false;
    
    // Sample points for analysis (every 3rd point to reduce noise)
    const points = path.filter((_, i) => i % 3 === 0);
    if (points.length < 10) return false;
    
    // Calculate bounding box
    const xs = points.map(p => p.x);
    const ys = points.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    const width = maxX - minX;
    const height = maxY - minY;
    
    // Triangle should have reasonable dimensions (not too small)
    if (width < 20 || height < 20) return false;
    
    // Check if the shape is roughly closed (end point near start point)
    const start = points[0];
    const end = points[points.length - 1];
    const distanceToClose = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );
    
    // Allow some tolerance for closing the triangle
    const maxCloseDistance = Math.max(width, height) * 0.3;
    const isClosed = distanceToClose < maxCloseDistance;
    
    // Detect corners by finding points where direction changes significantly
    let corners = [];
    const threshold = Math.PI / 3; // 60 degrees
    
    for (let i = 2; i < points.length - 2; i++) {
      const prev = points[i - 2];
      const curr = points[i];
      const next = points[i + 2];
      
      // Calculate angles
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      
      let angleDiff = Math.abs(angle2 - angle1);
      if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
      
      // If there's a significant direction change, it's likely a corner
      if (angleDiff > threshold) {
        corners.push({ point: curr, index: i, angle: angleDiff });
      }
    }
    
    // Filter corners that are too close to each other
    const filteredCorners = [];
    const minCornerDistance = Math.max(width, height) * 0.2;
    
    for (let corner of corners) {
      let tooClose = false;
      for (let existing of filteredCorners) {
        const dist = Math.sqrt(
          Math.pow(corner.point.x - existing.point.x, 2) + 
          Math.pow(corner.point.y - existing.point.y, 2)
        );
        if (dist < minCornerDistance) {
          tooClose = true;
          break;
        }
      }
      if (!tooClose) {
        filteredCorners.push(corner);
      }
    }
    
    // Triangle should have approximately 3 corners and be roughly closed
    return filteredCorners.length >= 2 && 
           filteredCorners.length <= 4 && 
           (isClosed || filteredCorners.length >= 3) &&
           path.length >= 30;
  }

  // Clear drawing timer on unmount
  useEffect(() => {
    return () => {
      if (drawingTimer) {
        clearTimeout(drawingTimer);
      }
    };
  }, [drawingTimer]);

  // Ask user1/user2
  function chooseUser(user) {
    localStorage.setItem('username', user);
    setShowUserPopup(false);
  }

  // Handle focus tap (also handles secret drawing)
  const handleFocusTap = (e) => {
    if (secretDrawingMode) {
      // Don't show focus indicator in secret drawing mode
      return;
    }
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

  // Handle camera switch
  const handleCameraSwitch = () => {
    setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
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
        onMouseDown={handleSecretDrawStart}
        onMouseMove={handleSecretDrawMove}
        onMouseUp={handleSecretDrawEnd}
        onTouchStart={handleSecretDrawStart}
        onTouchMove={handleSecretDrawMove}
        onTouchEnd={handleSecretDrawEnd}
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

      {/* Top Header */}
      <div className="camera-top-header">
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
        <div 
          className={`shutter-button ${mode === 'video' ? 'video-mode' : ''} ${isRecording ? 'recording' : ''}`}
          onClick={handleShutter}
        >
          {mode === 'video' && isRecording && <FiberManualRecordIcon />}
        </div>
        <div className="camera-switch-icon" onClick={handleCameraSwitch}>
          <FlipCameraIosIcon />
          <span className="switch-label">Switch</span>
        </div>
      </div>

      {/* Gallery Button */}
      <div className="gallery-button-container">
        <div className="last-photo-preview">
          <div className="photo-placeholder" />
          <span className="gallery-label">Gallery</span>
        </div>
      </div>

      {/* Bottom Header */}
      <div className="camera-bottom-header">
        <div className="bottom-text">
          <span>Camera Controls</span>
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

        .camera-top-header {
          position: absolute;
          top: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 25px;
          background: rgba(0, 0, 0, 0.8);
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


        .mode-selector {
          position: absolute;
          bottom: 250px;
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
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          padding: 5px 10px;
          border-radius: 20px;
          opacity: 0.6;
          background: transparent;
        }

        .mode-option.active {
          opacity: 1;
          color: #3b99fc;
          background: transparent;
        }

        .mode-option:hover {
          opacity: 1;
        }

        .camera-controls {
          position: absolute;
          bottom: 120px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 20;
        }
        
        .gallery-button-container {
          position: absolute;
          bottom: 80px;
          left: 15px;
          z-index: 20;
        }

        .last-photo-preview {
          width: 40px;
          height: 40px;
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
          position: relative;
          overflow: hidden;
        }

        .shutter-button.video-mode {
          background: #ff4444;
        }

        .shutter-button.recording {
          animation: recordingPulse 1s infinite;
        }

        .camera-switch-icon {
          color: white;
          cursor: pointer;
          padding: 12px;
          border-radius: 50%;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: absolute;
          right: 15px;
        }

        .camera-switch-icon:hover {
          transform: scale(1.1);
        }

        .switch-label {
          font-size: 10px;
          color: white;
          margin-top: 2px;
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
          background: white;
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
          position: absolute;
          bottom: 120px;
          width: 100%;
          display: flex;
          justify-content: center;
          gap: 10px;
          z-index: 20;
          overflow-x: hidden;
          padding: 0 5px;
        }
        
        .camera-bottom-header {
          position: absolute;
          bottom: 0;
          width: 100%;
          background: rgba(0, 0, 0, 0.8);
          z-index: 20;
          padding: 5px 0;
          display: flex;
          flex-direction: column-reverse;
          align-items: center;
          height: 60px;
        }
        
        .bottom-text {
          margin-bottom: 2px;
          color: white;
          font-size: 10px;
        }
          
        .camera-controls {
          position: absolute;
          bottom: 50px;
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          z-index: 20;
        }
          
          .shutter-button {
            width: 60px;
            height: 60px;
            left: 10px;
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
