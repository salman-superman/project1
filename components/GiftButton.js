import { useState } from 'react';

export default function GiftButton({ onOpen }) {
  return (
    <button 
      onClick={onOpen}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        marginLeft: '10px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        backgroundColor: '#f0f0f0',
        transition: 'background-color 0.2s'
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#e0e0e0'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#f0f0f0'}
    >
      <img 
        src="/gift-icon.svg" 
        alt="Send Gift"
        style={{
          width: '24px',
          height: '24px',
          transition: 'transform 0.2s'
        }}
      />
    </button>
  );
}
