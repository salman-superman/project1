import { useState, useEffect } from 'react';
import ClosedState from './ClosedState';
import OpeningState from './OpeningState';
import OpenState from './OpenState';
import styles from './styles.module.css';

export default function AnimatedGiftBox({ message, onOpenComplete }) {
  const [state, setState] = useState('closed'); // 'closed', 'opening', 'open'
  const [showHearts, setShowHearts] = useState(false);

  const handleOpen = () => {
    if (state === 'closed') {
      setState('opening');
      setTimeout(() => {
        setState('open');
        setShowHearts(true);
        onOpenComplete?.();
      }, 1000); // Match this with opening animation duration
    }
  };

  return (
    <div className={`${styles['gift-box']} ${state}`}>
      {state === 'closed' && <ClosedState onClick={handleOpen} styles={styles} />}
      {state === 'opening' && <OpeningState styles={styles} />}
      {state === 'open' && <OpenState message={message} styles={styles} />}
      
      {showHearts && (
        <div className={styles['hearts-container']}>
          {[...Array(15)].map((_, i) => (
            <div key={i} className={styles.heart} style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 0.5}s`
            }}>❤️</div>
          ))}
        </div>
      )}
    </div>
  );
}
