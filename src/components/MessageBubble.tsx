import React from 'react';
import { 
  ThumbsUp, 
  ThumbsDown, 
  ExternalLink,
  MessageCircle,
  Brain,
  User,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
  sources?: string[];
  followUps?: string[];
  rating?: 'up' | 'down' | null;
}

interface MessageBubbleProps {
  message: Message;
  onRating: (messageId: string, rating: 'up' | 'down') => void;
  onFollowUp: (question: string) => void;
  onViewSource: (source: string) => void;
  darkMode: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRating,
  onFollowUp,
  onViewSource,
  darkMode
}) => {
  const isUser = message.type === 'user';
  const isError = message.type === 'error';
  const [copied, setCopied] = React.useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatContent = (content: string) => {
    const paragraphs = content.split('\n\n').filter(p => p.trim());
    
    return paragraphs.map((paragraph, index) => {
      // Handle bullet points and numbered lists
      if (paragraph.includes('•') || paragraph.match(/^\d+\./)) {
        const items = paragraph.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-2 mb-6">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-sm leading-relaxed">
                {formatTextWithBold(item.replace(/^[•\d+\.]\s*/, ''))}
              </li>
            ))}
          </ul>
        );
      }
      
      // Handle headings
      if (paragraph.match(/^#{1,3}\s/)) {
        const level = paragraph.match(/^#{1,3}/)?.[0].length || 1;
        const text = paragraph.replace(/^#{1,3}\s/, '');
        const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
        
        return (
          <HeadingTag key={index} className="font-semibold text-lg mb-3 mt-6 first:mt-0">
            {formatTextWithBold(text)}
          </HeadingTag>
        );
      }
      
      // Regular paragraphs
      return (
        <p key={index} className="text-sm leading-relaxed mb-4 last:mb-0">
          {formatTextWithBold(paragraph)}
        </p>
      );
    });
  };

  const formatTextWithBold = (text: string) => {
    // Convert **text** to <strong>text</strong>
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        const boldText = part.slice(2, -2);
        return <strong key={index} className="font-semibold">{boldText}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-4xl flex ${isUser ? 'flex-row-reverse' : 'flex-row'} space-x-4`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
          isUser 
            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 ml-4' 
            : isError 
              ? 'bg-gradient-to-r from-highlight-500 to-highlight-600 mr-4'
              : 'bg-gradient-to-r from-primary-500 to-secondary-500 mr-4'
        }`}>
          {isUser ? (
            <User className="w-6 h-6 text-white" />
          ) : isError ? (
            <AlertTriangle className="w-6 h-6 text-white" />
          ) : (
            <Brain className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div className={`flex-1 ${isUser ? 'mr-4' : 'ml-4'}`}>
          <div className={`rounded-3xl px-8 py-6 shadow-lg border relative group transition-all duration-500 ${
            isUser 
              ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white' 
              : isError
                ? 'bg-highlight-50 dark:bg-highlight-900/20 text-highlight-800 dark:text-highlight-200 border-highlight-200 dark:border-highlight-700'
                : 'bg-accent-50 dark:bg-dark-surface text-accent-800 dark:text-accent-100 border-accent-200 dark:border-dark-muted'
          }`}>
            
            {/* Copy button for AI messages */}
            {!isUser && (
              <button
                onClick={handleCopyMessage}
                className={`absolute top-3 right-3 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 ${
                  isError 
                    ? 'hover:bg-highlight-100 dark:hover:bg-highlight-800/30 text-highlight-600 dark:text-highlight-400'
                    : 'hover:bg-accent-100 dark:hover:bg-dark-muted text-accent-500 dark:text-accent-400'
                }`}
                title="Copy message"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-secondary-600 dark:text-secondary-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}

            <div className="pr-10">
              {isUser ? (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{formatTextWithBold(message.content)}</p>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {formatContent(message.content)}
                </div>
              )}
            </div>
            
            {/* Timestamp */}
            <div className={`mt-4 text-xs ${
              isUser 
                ? 'text-primary-100' 
                : isError 
                  ? 'text-highlight-600 dark:text-highlight-400'
                  : 'text-accent-500 dark:text-accent-400'
            }`}>
              {message.timestamp.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </div>
          </div>

          {/* AI Message Actions */}
          {!isUser && (
            <div className="mt-6 space-y-6">
              {/* Sources */}
              {message.sources && message.sources.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {message.sources.map((source, index) => (
                    <button
                      key={index}
                      onClick={() => onViewSource(source)}
                      className={`flex items-center space-x-2 text-xs px-4 py-3 rounded-xl transition-all duration-300 shadow-sm ${
                        isError
                          ? 'bg-highlight-100 dark:bg-highlight-900/30 hover:bg-highlight-200 dark:hover:bg-highlight-800/40 text-highlight-700 dark:text-highlight-300 border border-highlight-200 dark:border-highlight-700'
                          : 'bg-accent-100 dark:bg-dark-muted hover:bg-accent-200 dark:hover:bg-dark-surface text-accent-700 dark:text-accent-300 border border-accent-200 dark:border-dark-surface'
                      }`}
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span className="truncate max-w-[200px]">{source}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Follow-up Questions */}
              {message.followUps && message.followUps.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-accent-700 dark:text-accent-300">Continue exploring:</p>
                  <div className="flex flex-wrap gap-3">
                    {message.followUps.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => onFollowUp(question)}
                        className={`flex items-center space-x-3 text-sm px-5 py-3 rounded-2xl transition-all duration-300 border shadow-sm hover:shadow-md ${
                          isError
                            ? 'bg-highlight-50 dark:bg-highlight-900/20 hover:bg-highlight-100 dark:hover:bg-highlight-800/30 text-highlight-700 dark:text-highlight-300 border-highlight-200 dark:border-highlight-700'
                            : 'bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-800/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-700'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-left">{question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Rating - only for successful AI responses */}
              {!isError && (
                <div className="flex items-center space-x-6">
                  <span className="text-sm text-accent-600 dark:text-accent-400">How was this response?</span>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onRating(message.id, 'up')}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        message.rating === 'up' 
                          ? 'bg-secondary-100 dark:bg-secondary-900/30 text-secondary-600 dark:text-secondary-400 shadow-sm' 
                          : 'hover:bg-accent-100 dark:hover:bg-dark-muted text-accent-600 dark:text-accent-400'
                      }`}
                      title="Helpful response"
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onRating(message.id, 'down')}
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        message.rating === 'down' 
                          ? 'bg-highlight-100 dark:bg-highlight-900/30 text-highlight-600 dark:text-highlight-400 shadow-sm' 
                          : 'hover:bg-accent-100 dark:hover:bg-dark-muted text-accent-600 dark:text-accent-400'
                      }`}
                      title="Needs improvement"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;