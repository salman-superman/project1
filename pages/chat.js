import { useEffect, useRef, useState } from 'react';
import { db, dbFirestore } from '../firebaseConfig';
import { onValue, push, ref, set, update, remove } from 'firebase/database';
import { onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';
import TypingIndicator from '../components/TypingIndicator.js';
import GiftButton from '../components/GiftButton';
import GiftComposerModal from '../components/GiftComposerModal';
import GiftMessage from '../components/GiftMessage';
export default function Chat() {

  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [showReactions, setShowReactions] = useState(null);
  const [showHeartBlast, setShowHeartBlast] = useState(false);
  const [showFallingHearts, setShowFallingHearts] = useState(false);
  const [circleDrawn, setCircleDrawn] = useState(false);
  const [replyTo, setReplyTo] = useState(null);
  const [showIncomingCall, setShowIncomingCall] = useState(false);
  const [expandedMessages, setExpandedMessages] = useState(new Set());
  const chatEndRef = useRef(null);
  const router = useRouter();
  const [otherUserStatus, setOtherUserStatus] = useState({});
  const [menuClickCount, setMenuClickCount] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchPath, setTouchPath] = useState([]);
  const chatInputRef = useRef(null);
  const [showTypingAvatar, setShowTypingAvatar] = useState(false);
  const [showGiftBlast, setShowGiftBlast] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);


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
  
  useEffect(() => {
    set(onlineRef, { online: true });
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      set(onlineRef, { online: false, lastSeen: Date.now() });
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [onlineRef]);

  useEffect(() => {
    const callDocRef = doc(dbFirestore, "calls", "test-call");

    const unsubscribe = onSnapshot(callDocRef, (doc) => {
      const data = doc.data();
      if (data?.to === currentUser && data?.isRinging && !data?.accepted) {
        // ✅ Incoming call
        console.log("Incoming call from", data.from);

        // Show call UI ONLY if user is in chat screen
        if (window.location.pathname === "/chat") {
          setShowIncomingCall(true);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);


  
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
    let timeout;

    const unsubscribe = onValue(typingRef, (snapshot) => {
      const isTyping = snapshot.val();
      if (isTyping) {
        setShowTypingAvatar(true);
        clearTimeout(timeout); // stop any previous hiding
      } else {
        timeout = setTimeout(() => {
          setShowTypingAvatar(false);
        }, 3000); // Wait 3 seconds before hiding
      }
    });

    return () => unsubscribe();
  }, [otherUser]);


  // Commented-out gift feature code removed to resolve TypeScript parsing errors.
  // If needed, this can be re-implemented or uncommented after proper integration.
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
    }, 1000);
  };

  const deleteMessage = (id) => {
    if (circleDrawn) {
      alert("Messages are protected from deletion because a circle has been drawn.");
      return;
    }
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

  // Moved to return statement
  const replyToMessage = (msg) => {
    setReplyTo(msg);
    if (chatInputRef.current) {
      chatInputRef.current.focus();
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setTouchStartX(touch.clientX);
    setTouchStartY(touch.clientY);
    setTouchPath([{ x: touch.clientX, y: touch.clientY }]);
  };

  const handleTouchMove = (e) => {
    if (touchStartX !== null) {
      const touch = e.touches[0];
      setTouchPath(prev => [...prev, { x: touch.clientX, y: touch.clientY }]);
    }
  };

  const handleTouchEnd = (e, msg) => {
    if (touchStartX !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      if (touchEndX - touchStartX > 50) { // Swipe right threshold
        replyToMessage(msg);
      } else {
        // Check if the touch path resembles a circle
        if (touchPath.length > 10) {
          const start = touchPath[0];
          const end = touchPath[touchPath.length - 1];
          const dx = Math.abs(start.x - end.x);
          const dy = Math.abs(start.y - end.y);
          if (dx < 30 && dy < 30) { // Rough check if start and end are close
            setCircleDrawn(true);
            alert("Circle detected! Messages are now protected from deletion for you.");
          }
        }
      }
      setTouchStartX(null);
      setTouchStartY(null);
      setTouchPath([]);
    }
  };

  const handleClearChat = () => {
    if (circleDrawn) {
      alert("Messages are protected from deletion because a circle has been drawn.");
      return;
    }
    if (window.confirm("Are you sure you want to clear all messages?")) {
      set(ref(db, 'messages'), null);
    }
  };

  const handleExit = () => {
    set(onlineRef, { online: false, lastSeen: Date.now() });
    router.push('/');
  };

  const triggerFallingHearts = () => {
    // Store the action in Firebase to synchronize across users
    const actionRef = push(ref(db, 'actions'));
    set(actionRef, {
      type: 'fallingHearts',
      time: Date.now(),
      sender: currentUser
    });
  };

  useEffect(() => {
    const actionsRef = ref(db, 'actions');
    onValue(actionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const latestAction = Object.values(data).pop(); // Get the latest action
        if (latestAction.type === 'fallingHearts') {
          setShowFallingHearts(true);
          setTimeout(() => {
            setShowFallingHearts(false);
            // Optionally clean up old actions to prevent database growth
            if (Object.keys(data).length > 10) {
              const oldestKey = Object.keys(data)[0];
              remove(ref(db, `actions/${oldestKey}`));
            }
          }, 5000);
        }
      }
    });
  }, [currentUser]);

 const handleSendGift = (giftMessage) => {
  // Show sending animation
  setShowGiftBlast(true);
  
  const msgRef = push(ref(db, 'messages'));
  set(msgRef, {
    text: giftMessage,
    time: Date.now(),
    sender: currentUser, // e.g. "user1"
    seen: false,
    type: "gift",       // <- Must be "gift"
    opened: false       // <- New field!
  });
  
  // Do not manually update messages state to avoid duplication
  // The Firebase onValue listener will handle the update
  
  setTimeout(() => {
    setShowGiftBlast(false);
    // Shake effect when gift appears in chat
    setTimeout(() => {
      const lastMessage = document.querySelector('.message-container:last-child');
      if (lastMessage) {
        lastMessage.classList.add('gift-arrival-shake');
        setTimeout(() => {
          lastMessage.classList.remove('gift-arrival-shake');
        }, 1000);
      }
      // Scroll to the latest message
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 300);
  }, 3000);
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

  

  const acceptCall = async () => {
    await updateDoc(doc(dbFirestore, "calls", "test-call"), {
      accepted: true
    });
    setShowIncomingCall(false);
  };

  const rejectCall = async () => {
    await deleteDoc(doc(dbFirestore, "calls", "test-call"));
    setShowIncomingCall(false);
  };

  const startCall = async () => {
    try {
      await set(doc(dbFirestore, "calls", "test-call"), {
        from: currentUser,
        to: otherUser,
        isRinging: true,
        accepted: false,
        timestamp: Date.now()
      });
      alert("Call started!");
    } catch (err) {
      console.error("Call error:", err);
      alert("Failed to start call");
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return isNaN(date) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const shouldTruncateMessage = (text) => {
    if (!text || typeof text !== 'string') return false;
    const lines = text.split('\n');
    return lines.length > 6 || text.length > 300; // 6 lines or approximately 50 chars * 6 lines
  };

  const getTruncatedMessage = (text) => {
    const lines = text.split('\n');
    if (lines.length > 6) {
      return lines.slice(0, 6).join('\n');
    }
    if (text.length > 300) {
      return text.substring(0, 300);
    }
    return text;
  };

  const toggleMessageExpansion = (messageId) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };
  // Button moved to return statement


  return (
    <div className="chat-wrapper">
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
          <span className="header-link" onClick={handleClearChat}>Clear Chat</span>
          <span className="header-separator">|</span>
          <span className="header-link" onClick={startCall}>📞 Call</span>
          <span className="header-separator">|</span>
          <span className="header-link" onClick={triggerFallingHearts}>Fall</span>
          <span className="header-separator">|</span>
          <span className="header-link" onClick={handleExit}>Exit</span>
          <GiftButton onOpen={() => setShowGiftModal(true)} />
        </div>
      </div>
      <div className="chat-container">
        {showGiftBlast && (
          <div className="gift-blast-container">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="gift-blast"
                style={{
                  left: `${Math.random() * 90 + 5}%`,
                  animationDelay: `${Math.random() * 1.5}s`
                }}
              >
                🎁
              </div>
            ))}
          </div>
        )}

        {showHeartBlast && (
          <div className="heart-blast-container">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="heart-blast heart-blast-bottom-to-top" style={{ left: `${Math.random() * 80 + 10}%`, animationDelay: `${Math.random() * 1.5}s` }}>❤️</div>
            ))}
          </div>
        )}
        {showFallingHearts && (
          <div className="heart-blast-container">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className="heart-blast heart-fall-top-to-bottom" style={{ left: `${Math.random() * 80 + 10}%`, animationDelay: `${Math.random() * 2}s` }}>❤️</div>
            ))}
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            className={`message-container ${msg.sender === currentUser ? 'own-message-container' : 'other-message-container'}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={(e) => handleTouchEnd(e, msg)}
          >
            {msg.type === 'gift' ? (
              <GiftMessage
                message={msg.text}
                isSender={msg.sender === currentUser}
                isOpened={msg.opened || false}
                onOpen={() => {
                  // Mark as opened in database
                  update(ref(db, `messages/${msg.id}`), { opened: true });
                  setShowHeartBlast(true);
                  setTimeout(() => setShowHeartBlast(false), 3000);
                }}
                onDoubleTap={() => {
                  // You can add additional love effect handling here if needed
                }}
              />
            ) : (
              <div className={`chat-bubble ${msg.sender === currentUser ? 'own-message' : 'other-message'}`}>
                {/* Keep all your existing regular message rendering code here */}
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
                  <img
                    src={msg.image}
                    alt="sent"
                    className="chat-image"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        window.open(msg.image, '_blank');
                      }
                    }}
                  />
                ) : (
                  <div className="chat-text">
                    {shouldTruncateMessage(msg.text) && !expandedMessages.has(msg.id) ? (
                      <>
                        {getTruncatedMessage(msg.text)}
                        <button 
                          className="read-more-btn" 
                          onClick={() => toggleMessageExpansion(msg.id)}
                        >
                          ...Read more
                        </button>
                      </>
                    ) : (
                      <>
                        {msg.text}
                        {shouldTruncateMessage(msg.text) && expandedMessages.has(msg.id) && (
                          <button 
                            className="read-less-btn" 
                            onClick={() => toggleMessageExpansion(msg.id)}
                          >
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </div>
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
            )}
            
            {/* Keep your message actions and reaction picker here */}
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
            
            {showReactions === msg.id && (
              <div className="reaction-picker">
                {['❤️', '😂', '😮', '😢', '👍', '🔥'].map(emoji => (
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

      {showTypingAvatar && <TypingIndicator />}

      {showIncomingCall && (
        <div className="incoming-call-popup">
          <p>📞 Incoming call...</p>
          <button onClick={acceptCall}>Accept</button>
          <button onClick={rejectCall}>Reject</button>
        </div>
      )}
      {showGiftModal && (
        <GiftComposerModal
          onClose={() => setShowGiftModal(false)}
          onSend={(giftMessage) => {
            handleSendGift(giftMessage);
            setShowGiftModal(false);
          }}
        />
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
  </div>
  );
}
