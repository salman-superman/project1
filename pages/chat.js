import { useEffect, useRef, useState } from 'react';
import { db } from '../firebaseConfig';
import { onValue, push, ref, set, update, remove } from 'firebase/database';
import { useRouter } from 'next/router';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showReactions, setShowReactions] = useState(null);
  const [showHeartBlast, setShowHeartBlast] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const chatEndRef = useRef(null);
  const router = useRouter();
  const [otherUserStatus, setOtherUserStatus] = useState({});
  const [menuClickCount, setMenuClickCount] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const chatInputRef = useRef(null);

  const currentUser = typeof window !== 'undefined' ? localStorage.getItem('username') : 'user1';
  const otherUser = currentUser === 'user1' ? 'user2' : 'user1';

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) router.push('/');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [router]);
  useEffect(() => {
    const statusRef = ref(db, 'status/' + otherUser);
    onValue(statusRef, (snapshot) => {
      const status = snapshot.val() || { online: false, lastSeen: Date.now() };
      setOtherUserStatus(status);
    });
  }, [otherUser]);

  const onlineRef = ref(db, 'status/' + currentUser);
set(onlineRef, { online: true });

window.addEventListener('beforeunload', () => {
  set(onlineRef, { online: false, lastSeen: Date.now() });
});


  useEffect(() => {
    const messagesRef = ref(db, 'messages');
    onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      const loadedMessages = data ? Object.entries(data).map(([id, msg]) => ({ id, ...msg })) : [];
      setMessages(loadedMessages);
      // Mark messages as seen if current user is not the sender
      if (data) {
        Object.entries(data).forEach(([id, msg]) => {
          if (msg.sender !== currentUser && !msg.seen) {
            update(ref(db, `messages/${id}`), { seen: true });
          }
        });
      }
    });
  }, [currentUser]);

  useEffect(() => {
    const typingRef = ref(db, 'typing/' + otherUser);
    onValue(typingRef, (snapshot) => {
      setOtherUserTyping(snapshot.val());
    });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, otherUserTyping]);

  const sendMessage = () => {
    if (message.trim() === '') return;
    const msgRef = push(ref(db, 'messages'));
    set(msgRef, {
      text: message,
      time: Date.now(),
      sender: currentUser,
      seen: false,
      type: 'text'
    });
    setMessage('');
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };

  const handleTyping = (e) => {
    setMessage(e.target.value);
    setTyping(true);
    update(ref(db, 'typing'), { [currentUser]: true });
    setTimeout(() => {
      update(ref(db, 'typing'), { [currentUser]: false });
      setTyping(false);
    }, 1500);
  };

  const deleteMessage = (id) => {
    remove(ref(db, `messages/${id}`));
  };

  const addReaction = (messageId, emoji) => {
    const messageRef = ref(db, `messages/${messageId}/reactions/${currentUser}`);
    set(messageRef, emoji);
    setShowReactions(null);
    if (emoji === '❤️') {
      setShowHeartBlast(true);
      setTimeout(() => setShowHeartBlast(false), 3000);
    }
  };

  const replyToMessage = (msg) => {
    setReplyTo(msg);
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e, msg) => {
    if (touchStartX !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchEndX - touchStartX > 50) { // Swipe right threshold
        replyToMessage(msg);
      }
      setTouchStartX(null);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear all messages?")) {
      set(ref(db, 'messages'), null);
    }
  };

  const handleExit = () => {
    set(onlineRef, { online: false, lastSeen: Date.now() });
    router.push('/');
  };

  const sendReply = () => {
    if (message.trim() === '') return;
    const msgRef = push(ref(db, 'messages'));
    set(msgRef, {
      text: message,
      time: Date.now(),
      sender: currentUser,
      seen: false,
      type: 'text',
      replyTo: replyTo ? {
        id: replyTo.id,
        text: replyTo.text,
        sender: replyTo.sender
      } : null
    });
    setMessage('');
    setReplyTo(null);
    setTimeout(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
  };


  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return isNaN(date) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
<button
  onClick={() => {
    const newCount = menuClickCount + 1;
    setMenuClickCount(newCount);
    
    if (newCount >= 3) {
      setMenuClickCount(0);
      router.push('/pin');
    } else if (confirm("Are you sure you want to clear all messages?")) {
      set(ref(db, 'messages'), null);
    }
  }}
  className="clear-chat-button"
>
  Clear Chat 🧹
</button>


  return (
    <>
      <div className="chat-header">
        <div className="chat-header-left">
          <div className={`status-indicator ${otherUserStatus?.online ? 'online-status' : 'offline-status'}`}>
            {otherUserStatus?.online
              ? '🟢 Online'
              : otherUserStatus?.lastSeen
              ? `Last seen at ${formatTime(otherUserStatus.lastSeen)}`
              : '⚫ Offline'}
          </div>
        </div>
        <div className="header-buttons">
          <button className="clear-chat-button" onClick={handleClearChat}>Clear Chat</button>
          <button className="exit-button" onClick={handleExit}>Exit</button>
        </div>
      </div>
      <div className="chat-container">
        {showHeartBlast && (
          <div className="heart-blast-container">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="heart-blast heart-blast-bottom-to-top" style={{ left: `${Math.random() * 80 + 10}%`, animationDelay: `${Math.random() * 1.5}s` }}>❤️</div>
            ))}
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`message-container ${msg.sender === currentUser ? 'own-message-container' : 'other-message-container'}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, msg)}
          >
            <div
              className={`chat-bubble ${msg.sender === currentUser ? 'own-message' : 'other-message'}`}
              onDoubleClick={() => addReaction(msg.id, '❤️')}
            >
            {/* Reply indicator */}
            {msg.replyTo && (
              <div className="reply-indicator">
                <div className="reply-line"></div>
                <div className="reply-content">
                  <span className="reply-sender">{msg.replyTo.sender}</span>
                  <span className="reply-text">{msg.replyTo.text}</span>
                </div>
              </div>
            )}

            {msg.type === 'image' ? (
              <img src={msg.image} alt="sent" className="chat-image" onClick={() => window.open(msg.image, '_blank')} />
            ) : (
              <div className="chat-text">{msg.text}</div>
            )}

            {/* Reactions */}
            {msg.reactions && (
              <div className="message-reactions">
                {Object.entries(msg.reactions).map(([user, emoji]) => (
                  <span key={user} className="reaction-emoji">{emoji}</span>
                ))}
              </div>
            )}

            <div className="chat-meta">
              <span className="chat-time">{formatTime(msg.time)}</span>
              {msg.sender === currentUser && (
                <span className="chat-tick">{msg.seen ? '✓✓' : '✓'}</span>
              )}
            </div>
          </div>

          {/* Message actions */}
          <div className="message-actions">
            <button 
              className="action-btn reply-btn" 
              onClick={() => replyToMessage(msg)}
              title="Reply"
            >
              ↩️
            </button>
            <button 
              className="action-btn reaction-btn" 
              onClick={() => setShowReactions(showReactions === msg.id ? null : msg.id)}
              title="React"
            >
              😊
            </button>
            {msg.sender === currentUser && (
              <button 
                className="action-btn delete-btn" 
                onClick={() => deleteMessage(msg.id)}
                title="Delete"
              >
                🗑️
              </button>
            )}
          </div>

          {/* Reaction picker */}
          {showReactions === msg.id && (
            <div className="reaction-picker">
              {['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥'].map(emoji => (
                <button
                  key={emoji}
                  className="reaction-option"
                  onClick={() => addReaction(msg.id, emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {otherUserTyping && (
        <div className="typing-indicator">
          <span className="dot"></span><span className="dot"></span><span className="dot"></span>
        </div>
      )}

      <div ref={chatEndRef} />


      {/* Reply preview */}
      {replyTo && (
        <div className="reply-preview">
          <div className="reply-preview-content">
            <span className="reply-preview-label">Replying to {replyTo.sender}</span>
            <span className="reply-preview-text">{replyTo.text}</span>
          </div>
          <button 
            className="reply-cancel-btn" 
            onClick={() => setReplyTo(null)}
          >
            ✕
          </button>
        </div>
      )}

      <div className="chat-input-container">
        <input
          ref={chatInputRef}
          value={message}
          onChange={handleTyping}
          placeholder={replyTo ? "Reply to message..." : "Type a message..."}
          onKeyDown={(e) => e.key === 'Enter' && (replyTo ? sendReply() : sendMessage())}
          className="chat-input"
        />
        <button 
          onClick={replyTo ? sendReply : sendMessage} 
          className="chat-button send-button"
        >
          {replyTo ? 'Reply' : 'Send'}
        </button>
      </div>

    </div>
  </>
  );
}
