import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock, Globe, Video, User, Mail, Plus, Trash2, ArrowLeft, CalendarPlus, RotateCcw } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import MeetingButton from './MeetingButton';
import { apiClient } from '../../services/apiClient';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  onRefresh: () => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  onRefresh,
}) => {
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [undoSubmitting, setUndoSubmitting] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/bookings/${bookingId}`);
      if (res.data.success) {
        setBooking(res.data.data);
      }
    } catch (err) {
      console.error('[Details Modal Error]: Failed to fetch booking logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchDetails();
    }
  }, [isOpen, bookingId]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setNoteSubmitting(true);
      const res = await apiClient.post(`/bookings/${bookingId}/notes`, { text: newNote });
      if (res.data.success) {
        setBooking(res.data.data);
        setNewNote('');
      }
    } catch (err) {
      console.error('[Details Modal Note Error]: Failed to append host note:', err);
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    try {
      const res = await apiClient.delete(`/bookings/${bookingId}/notes/${noteId}`);
      if (res.data.success) {
        setBooking(res.data.data);
      }
    } catch (err) {
      console.error('[Details Modal Note Error]: Failed to delete host note:', err);
    }
  };

  const handleUndoCancel = async () => {
    try {
      setUndoSubmitting(true);
      const res = await apiClient.post(`/bookings/${bookingId}/undo-cancel`);
      if (res.data.success) {
        setBooking(res.data.data);
        onRefresh();
      }
    } catch (err) {
      console.error('[Details Modal Undo Error]: Restoring booking slot failed:', err);
    } finally {
      setUndoSubmitting(false);
    }
  };

  const getGoogleCalendarUrl = (b: any, et: any) => {
    const start = dayjs(b.startTime).utc().format('YYYYMMDDTHHmmss[Z]');
    const end = dayjs(b.endTime).utc().format('YYYYMMDDTHHmmss[Z]');
    const title = encodeURIComponent(`${et.title} with ${b.bookerName}`);
    const details = encodeURIComponent(`Meeting scheduled via CalClone. Meet link: ${b.googleMeetLink || 'None'}`);
    const loc = encodeURIComponent(b.googleMeetLink || et.locationType || 'Online');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}&location=${loc}`;
  };

  const getOutlookCalendarUrl = (b: any, et: any) => {
    const start = encodeURIComponent(b.startTime);
    const end = encodeURIComponent(b.endTime);
    const title = encodeURIComponent(`${et.title} with ${b.bookerName}`);
    const details = encodeURIComponent(`Meeting scheduled via CalClone. Meet link: ${b.googleMeetLink || 'None'}`);
    const loc = encodeURIComponent(b.googleMeetLink || et.locationType || 'Online');
    return `https://outlook.live.com/calendar/0/deeplink/compose?path=/calendar/action/compose&rru=addevent&subject=${title}&startdt=${start}&enddt=${end}&body=${details}&location=${loc}`;
  };

  // Prevent background scrolling when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const apiBase = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace('/v1', '') 
    : 'http://localhost:5001/api';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] dark:bg-black/60"
          />

          {/* Panel */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl p-6 z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  {loading ? 'Loading Details...' : booking?.eventTypeId?.title || 'Appointment Details'}
                </h3>
                <p className="text-xs text-gray-400">
                  {loading ? 'Retrieving metadata...' : `Booking ID: ${booking?._id}`}
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col gap-4 py-8 animate-pulse">
                <div className="h-6 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
                <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded w-full mt-4" />
              </div>
            ) : (
              <div className="overflow-y-auto max-h-[75vh] flex flex-col gap-6 pr-1">
                {/* Meta details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl dark:bg-gray-850">
                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{booking.bookerName}</p>
                      <p className="text-gray-400 text-[10px]">{booking.bookerEmail}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {dayjs(booking.startTime).format('dddd, MMMM D, YYYY')}
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        {dayjs(booking.startTime).format('hh:mm A')} - {dayjs(booking.endTime).format('hh:mm A')} (UTC)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">{booking.guestTimezone}</p>
                      <p className="text-gray-400 text-[10px]">Timezone offset</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-300">
                    <Video className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Google Meet</p>
                      <p className="text-gray-400 text-[10px] truncate max-w-[200px]">
                        {booking.googleMeetLink || 'No Meet Link Generated'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-t border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-500">Status:</span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                      booking.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : booking.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : booking.status === 'live'
                        ? 'bg-amber-100 text-amber-800 animate-pulse dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Join countdown widget */}
                  {booking.status !== 'cancelled' && (
                    <MeetingButton
                      startTime={booking.startTime}
                      endTime={booking.endTime}
                      meetingUrl={booking.googleMeetLink}
                    />
                  )}
                </div>

                {/* Cancellation Feedback Board */}
                {booking.status === 'cancelled' && (
                  <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl dark:bg-rose-950/20 dark:border-rose-900/30 flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">Cancellation Logs</h4>
                    <p className="text-xs text-rose-700 dark:text-rose-400">
                      <strong>Reason:</strong> {booking.cancellationReason || 'No reason provided.'}
                    </p>
                    {booking.cancellationFeedback && (
                      <p className="text-xs text-rose-600 dark:text-rose-400">
                        <strong>Optional Comments:</strong> {booking.cancellationFeedback}
                      </p>
                    )}
                    <div className="mt-2 flex justify-start">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleUndoCancel}
                        loading={undoSubmitting}
                        className="text-xs border-rose-200 text-rose-800 hover:bg-rose-100 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950"
                      >
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        <span>Undo Cancellation</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Calendar deep links invites */}
                {booking.status !== 'cancelled' && (
                  <div className="flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <CalendarPlus className="w-4 h-4 text-gray-400" />
                      <span>Add to Calendar Invites</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={getGoogleCalendarUrl(booking, booking.eventTypeId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Google Calendar
                      </a>
                      <a
                        href={getOutlookCalendarUrl(booking, booking.eventTypeId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300"
                      >
                        Outlook Web
                      </a>
                      <a
                        href={`${apiBase}/bookings/${bookingId}/ics`}
                        download
                        className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800 font-semibold text-gray-700 dark:text-gray-300"
                      >
                        iCal (.ics file)
                      </a>
                    </div>
                  </div>
                )}

                {/* Internal host notes board */}
                <div className="flex flex-col gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Internal Comments Board (Host Only)
                  </h4>

                  {/* Notes List */}
                  <div className="flex flex-col gap-2.5">
                    {(!booking.internalNotes || booking.internalNotes.length === 0) ? (
                      <p className="text-xs text-gray-400 italic">No comments or call prep feedback entered yet.</p>
                    ) : (
                      booking.internalNotes.map((note: any) => (
                        <div
                          key={note.id || note._id}
                          className="flex items-start justify-between gap-3 p-3 bg-gray-50 rounded-xl dark:bg-gray-850 group border border-gray-100 dark:border-gray-800"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-400 font-bold">
                              {note.author} • {dayjs(note.createdAt).format('MMM D, h:mm A')}
                            </span>
                            <p className="text-xs text-gray-700 dark:text-gray-300">{note.text}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteNote(note.id || note._id)}
                            className="text-gray-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 p-1 rounded transition"
                            title="Delete note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Write note form */}
                  <form onSubmit={handleAddNote} className="flex gap-2">
                    <Input
                      placeholder="e.g. Sales prep notes, consultation feedback..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      className="flex-1 text-xs"
                      id="note-input"
                    />
                    <Button
                      type="submit"
                      size="sm"
                      loading={noteSubmitting}
                      className="px-3"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      <span>Add</span>
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BookingDetailsModal;
