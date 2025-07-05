import './styles.css';

export default function GiftButton({ onOpen }) {
  return (
    <button className="gift-button" onClick={onOpen}>
      <img src="/gift-icon.svg" alt="Send Gift" />
    </button>
  );
}