export default function OpeningState({ styles }) {
  return (
    <div className={styles['opening-gift']}>
      <div className={`${styles.lid} ${styles.opening}`}></div>
      <div className={`${styles.box} ${styles.opening}`}></div>
    </div>
  );
}
