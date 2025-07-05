// components/GiftMessage.jsx
import { useState, useEffect } from 'react';
import styles from '../styles/GiftMessage.module.css';

export default function GiftMessage({ 
  message, 
  isSender, 
  isOpened,
  onOpen 
}) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isLoved, setIsLoved] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  // Handle opening gift
  const handleClick = () => {
    if (!isSender && !isOpened) {
      onOpen(); // Mark as opened in DB
    }
    setShowFullscreen(true);
  };

  // Handle double tap
  const handleDoubleClick = () => {
    if (isOpened) {
      setIsLoved(true);
      // Auto-close after 15 seconds
      const id = setTimeout(() => {
        setShowFullscreen(false);
      }, 15000);
      setTimeoutId(id);
    }
  };

  // Close when clicking outside
  const closeFullscreen = () => {
    setShowFullscreen(false);
    if (timeoutId) clearTimeout(timeoutId);
  };

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <div className={styles.container}>
      {/* Chat View Gift */}
      <div 
        className={`${styles.gift} ${isOpened ? styles.opened : ''}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {isOpened ? (
          <div className={styles.openedGift}>
            <div className={styles.lidOpen}></div>
            <div className={styles.boxOpen}></div>
          </div>
        ) : (
          <div className={styles.closedGift}>
            <div className={styles.lid}></div>
            <div className={styles.box}>
              <div className={styles.ribbon}></div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen View */}
      {showFullscreen && (
        <div className={styles.fullscreenOverlay} onClick={closeFullscreen}>
          <div 
            className={`${styles.fullscreenContent} ${isLoved ? styles.loved : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.message}>{message}</div>
            {isLoved && <div className={styles.hearts}>❤️</div>}
          </div>
        </div>
      )}
    </div>
  );
}