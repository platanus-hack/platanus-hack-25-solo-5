export function markdownToWhatsApp(text: string): string {
  let converted = text;

  converted = converted.replace(/^#### (.+)$/gm, '\n*$1*\n');
  converted = converted.replace(/^### (.+)$/gm, '\n*$1*\n');
  converted = converted.replace(/^## (.+)$/gm, '\n*$1*\n');
  converted = converted.replace(/^# (.+)$/gm, '\n*$1*\n');

  converted = converted.replace(/\*\*(.+?)\*\*/g, '*$1*');

  converted = converted.replace(/^[\s⁠]*- (.+)$/gm, '• $1');
  converted = converted.replace(/^[\s⁠]*\* (.+)$/gm, '• $1');

  converted = converted.replace(/```[\s\S]*?```/g, (match) => {
    return '`' + match.replace(/```/g, '').trim() + '`';
  });

  converted = converted.replace(/\[(.+?)\]\((.+?)\)/g, (match, text, url) => {
    if (text === url || text.trim() === url.trim()) {
      return url;
    }
    return `${text} (${url})`;
  });

  converted = converted.replace(/^---+$/gm, '────────────────');

  converted = converted.replace(/\n{3,}/g, '\n\n');

  converted = converted.replace(/[⁠]/g, '');

  return converted.trim();
}
