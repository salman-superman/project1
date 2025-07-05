import React from 'react';

export default function OpenState({ message, styles }) {
  return (
    <div className={`${styles['gift-box']} ${styles.open}`}>
      <div className={styles['lid-open']}></div>
      <div className={styles['box-open']}></div>
      <div className={styles.message}>{message}</div>
    </div>
  );
}
