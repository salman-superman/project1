import Image from 'next/image';

export default function TypingIndicator() {
  return (
    <div className="typing-indicator-avatar">
      <Image
        src="/typing-avatar.png"
        alt="Typing Avatar"
        width={50}
        height={50}
        priority
      />
    </div>
  );
}
