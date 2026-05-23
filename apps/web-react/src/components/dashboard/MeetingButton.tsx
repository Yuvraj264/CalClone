import React, { useState, useEffect } from 'react';
import { Video, ExternalLink, Copy, Check, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

interface MeetingButtonProps {
  startTime: string;
  endTime: string;
  meetingUrl: string;
}

export const MeetingButton: React.FC<MeetingButtonProps> = ({
  startTime,
  endTime,
  meetingUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const updateCountdown = () => {
      const now = dayjs();
      const start = dayjs(startTime);
      const end = dayjs(endTime);

      if (now.isAfter(end)) {
        setStatusText('Meeting Completed');
        setIsActive(false);
      } else if (now.isSameOrAfter(start) && now.isBefore(end)) {
        setStatusText('Meeting is Live! Join Now');
        setIsActive(true);
      } else {
        const diffMinutes = start.diff(now, 'minute');
        if (diffMinutes <= 10) {
          // Enable button exactly 10 mins before go-live
          setStatusText(`Starts in ${diffMinutes}m`);
          setIsActive(true);
        } else if (diffMinutes < 60) {
          setStatusText(`Starts in ${diffMinutes}m`);
          setIsActive(false);
        } else {
          const diffHours = start.diff(now, 'hour');
          if (diffHours < 24) {
            setStatusText(`Starts in ${diffHours}h`);
          } else {
            const diffDays = start.diff(now, 'day');
            setStatusText(`Starts in ${diffDays}d`);
          }
          setIsActive(false);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!meetingUrl) return;
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!meetingUrl) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold italic">
        <Clock className="w-3.5 h-3.5" />
        <span>No Link Configured</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 w-full sm:w-auto">
      {isActive ? (
        <a
          href={meetingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition duration-150 shadow-sm shadow-emerald-100 flex-1 sm:flex-initial"
        >
          <Video className="w-3.5 h-3.5 animate-pulse" />
          <span>Join Meeting</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <button
          type="button"
          disabled
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 rounded-xl cursor-not-allowed flex-1 sm:flex-initial"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{statusText}</span>
        </button>
      )}

      <button
        type="button"
        onClick={handleCopy}
        className="p-2 border border-gray-200 hover:bg-gray-50 rounded-xl dark:border-gray-850 dark:hover:bg-gray-900 transition relative"
        title="Copy Meeting Link"
      >
        {copied ? (
          <Check className="w-4.5 h-4.5 text-emerald-600" />
        ) : (
          <Copy className="w-4.5 h-4.5 text-gray-500 dark:text-gray-400" />
        )}
      </button>
    </div>
  );
};

export default MeetingButton;
