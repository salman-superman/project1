// components/GiftComposerModal.jsx
import { useState, useRef } from 'react';
import styles from '../styles/GiftComposer.module.css';
import EmojiPicker from 'emoji-picker-react';

export default function GiftComposerModal({ onClose, onSend }) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const paperRef = useRef(null);
  const giftBoxRef = useRef(null);
  const textareaRef = useRef(null);

  const handleSend = () => {
    if (!message.trim()) return;
    
    setIsSending(true);
    
    // 1. Paper scroll up animation
    paperRef.current.style.transform = 'translateY(-100px) rotate(-5deg)';
    paperRef.current.style.opacity = '0';
    
    // 2. Gift box receives paper animation
    setTimeout(() => {
      giftBoxRef.current.classList.add(styles.giftReceivePaper);
      
      // 3. Gift box close animation
      setTimeout(() => {
        giftBoxRef.current.classList.add(styles.giftCloseAnimation);
        
        // 4. Complete send process
        setTimeout(() => {
          onSend(message);
          onClose();
        }, 1000);
      }, 800);
    }, 500);
  };

  const handleEmojiClick = (emojiData) => {
    const cursorPosition = textareaRef.current.selectionStart;
    const newMessage = 
      message.substring(0, cursorPosition) + 
      emojiData.emoji + 
      message.substring(cursorPosition);
    setMessage(newMessage);
    setShowEmojiPicker(false);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBackdrop} onClick={onClose} />
      
      <div className={styles.modalContent}>
        <div className={styles.giftContainer}>
          <div 
            ref={giftBoxRef} 
            className={styles.giftBox}
          >
            <div className={styles.giftLid}></div>
            <div className={styles.giftBody}>
              <div className={styles.ribbonHorizontal}></div>
              <div className={styles.ribbonVertical}></div>
              <div className={styles.giftBow}></div>
            </div>
            <div className={styles.giftShine}></div>
          </div>
          
          <div className={styles.giftShadow}></div>
        </div>

        <div className={styles.messageComposer}>
          <div 
            ref={paperRef} 
            className={styles.messagePaper}
          >
            <div className={styles.paperTexture}>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your heartfelt message..."
                disabled={isSending}
              />
            </div>
            <button 
              className={styles.emojiButton}
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              😊
            </button>
            {showEmojiPicker && (
              <div className={styles.emojiPickerContainer}>
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
          
          <div className={styles.buttons}>
            <button 
              className={styles.cancelButton} 
              onClick={onClose} 
              disabled={isSending}
            >
              Cancel
            </button>
            <button 
              className={`${styles.sendButton} ${!message.trim() ? styles.disabled : ''}`}
              onClick={handleSend}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <span className={styles.sendingAnimation}>
                  <span>•</span><span>•</span><span>•</span>
                </span>
              ) : (
                'Send Gift'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
