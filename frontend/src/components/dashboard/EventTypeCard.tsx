import React from 'react';
import { Clock, Globe, Copy, Check } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface EventTypeCardProps {
  eventType: {
    id?: string;
    _id?: string;
    title: string;
    slug: string;
    duration: number;
    timezone?: string;
    isActive: boolean;
  };
  onCopyLink: (slug: string) => void;
  copiedSlug: string | null;
}

export const EventTypeCard: React.FC<EventTypeCardProps> = ({
  eventType,
  onCopyLink,
  copiedSlug,
}) => {
  const isCopied = copiedSlug === eventType.slug;
  const id = eventType.id || eventType._id;

  return (
    <Card hoverable className="p-6 flex flex-col justify-between h-48">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">
            {eventType.title}
          </h3>
          <Badge variant={eventType.isActive ? 'success' : 'neutral'}>
            {eventType.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <p className="text-xs text-gray-400 truncate">
          /{eventType.slug}
        </p>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span>{eventType.duration}m</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate max-w-[120px]">
              {eventType.timezone || 'UTC'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 mt-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCopyLink(eventType.slug)}
          className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-400" />
              <span>Copy link</span>
            </>
          )}
        </Button>

        <a href={`/book/${eventType.slug}`} className="text-xs font-semibold text-gray-900 hover:underline dark:text-white">
          Preview
        </a>
      </div>
    </Card>
  );
};

export default EventTypeCard;
