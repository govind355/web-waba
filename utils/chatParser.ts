import { Message } from '../types';

export const parseWhatsAppChat = (text: string): { name: string; messages: Message[] } | null => {
  const lines = text.split('\n');
  const messages: Message[] = [];
  const senders = new Map<string, number>(); // Track sender frequency to guess chat name

  // Regex for common WhatsApp export formats:
  // Android: 12/25/23, 8:30 PM - Name: Message
  // iOS: [12/25/23, 20:30:12] Name: Message
  const regex = /^(?:\[?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]?)(?:\s-\s)?\s(.*?):\s(.*)/;

  let currentMessage: Message | null = null;

  lines.forEach((line, index) => {
    const match = line.match(regex);

    if (match) {
      // It's a new message line
      const [_, dateStr, timeStr, senderName, content] = match;
      
      // Basic Date Parsing (assuming MM/DD/YYYY or DD/MM/YYYY based on locale is hard, simplifying to current/partial)
      // We mainly want valid time for display.
      const fullDateStr = `${dateStr} ${timeStr}`;
      const timestamp = new Date(fullDateStr);
      
      // Fallback if date parsing fails
      const validDate = !isNaN(timestamp.getTime()) ? timestamp : new Date();

      const isMe = senderName.toLowerCase() === 'you' || senderName.toLowerCase() === 'me' || senderName.toLowerCase().includes('(you)'); // Heuristic

      if (!isMe) {
          senders.set(senderName, (senders.get(senderName) || 0) + 1);
      }

      currentMessage = {
        id: `imported-${index}`,
        role: 'user', // We treat everything as 'user' role for display initially, but we need to differentiate 'me' vs 'them'
        text: content.trim(),
        timestamp: validDate,
        status: 'read',
        // We temporarily store the sender name in the message text or handle role mapping in the UI. 
        // For this app's "MessageBubble", role='user' is ME (right side), role='model' is THEM (left side).
        // Let's invert this for imported chats: "Me" -> User Role, "Them" -> Model Role (so they appear on left)
      };

      // ADJUST ROLE based on "Me" heuristic
      // NOTE: In export "You" usually implies the exporter. 
      // If the line says "You:", that's role='user'. 
      // If the line says "Alice:", that's role='model' (left side).
      if (senderName === 'You' || senderName.includes('\u202A')) { // \u202A is a control char often found in exports
         currentMessage.role = 'user';
      } else {
         currentMessage.role = 'model';
      }

      messages.push(currentMessage);
    } else {
      // Multi-line message continuation
      if (currentMessage && line.trim().length > 0) {
        currentMessage.text += `\n${line.trim()}`;
      }
    }
  });

  if (messages.length === 0) return null;

  // Guess Chat Name (most frequent sender who isn't me)
  let topSender = "Imported Chat";
  let maxCount = 0;
  senders.forEach((count, name) => {
      if (count > maxCount) {
          maxCount = count;
          topSender = name;
      }
  });

  return { name: topSender, messages };
};