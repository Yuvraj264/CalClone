import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CheckCircle2, Calendar, Clock, User, Mail, Globe } from 'lucide-react';
import dayjs from 'dayjs';

export default function BookingConfirmationPage() {
  const [details, setDetails] = useState<any>(null);

  useEffect(() => {
    const data = sessionStorage.getItem('last_booking_success');
    if (data) {
      setDetails(JSON.parse(data));
    }
  }, []);

  if (!details) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-black flex items-center justify-center p-4 font-sans animate-none">
        <Card className="max-w-md p-8 text-center flex flex-col items-center gap-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-pulse" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Booking Confirmed!</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your appointment has been successfully scheduled. An invitation link has been registered.
          </p>
          <Link
            to="/bookings"
            className="mt-2 text-xs font-semibold px-4 py-2 bg-black text-white rounded-xl hover:bg-gray-800"
          >
            Go to bookings list
          </Link>
        </Card>
      </div>
    );
  }

  const dateFormatted = dayjs(details.date).format('dddd, MMMM D, YYYY');
  
  // Calculate End Time based on duration
  const start = dayjs(`${details.date}T${details.time}:00`);
  const end = start.add(details.duration, 'minute');
  const timeRange = `${details.time} - ${end.format('HH:mm')}`;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black flex items-center justify-center p-4 font-sans animate-none">
      <Card className="w-full max-w-lg p-6 sm:p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-full flex items-center justify-center mb-2">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <Badge variant="success">Confirmed</Badge>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
            This meeting is scheduled
          </h2>
          <p className="text-xs text-gray-500 max-w-xs">
            We sent a calendar invitation link to your email address.
          </p>
        </div>

        {/* Meeting Details List */}
        <div className="border-t border-b border-gray-100 dark:border-gray-800 py-6 flex flex-col gap-4 text-xs">
          <div className="flex justify-between gap-4 py-1.5 border-b border-dashed border-gray-100 dark:border-gray-800 last:border-0">
            <span className="font-semibold text-gray-500">Event Title:</span>
            <span className="font-bold text-gray-900 dark:text-white">{details.eventTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-semibold">{dateFormatted}</span>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-semibold">{timeRange}</span>
          </div>

          <div className="flex items-center gap-3">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-semibold">{details.bookerName}</span>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-semibold">{details.bookerEmail}</span>
          </div>

          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300 font-semibold">{details.timezone}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/bookings"
            className="w-full text-center text-xs font-semibold py-2.5 bg-black text-white hover:bg-gray-850 rounded-xl transition-all duration-150"
          >
            Go to bookings list
          </Link>
        </div>
      </Card>
    </div>
  );
}
