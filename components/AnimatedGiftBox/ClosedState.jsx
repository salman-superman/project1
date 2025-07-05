export default function ClosedState({ onClick, styles }) {
  return (
    <div className={styles['closed-gift']} onClick={onClick}>
      <div className={styles.lid}></div>
      <div className={styles.box}>
        <div className={styles['ribbon-horizontal']}></div>
        <div className={styles['ribbon-vertical']}></div>
      </div>
      <span className={styles.hint}>Tap to open!</span>
    </div>
  );
}
