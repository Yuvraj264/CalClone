import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface CancelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
  onConfirm: (payload: { reason: string; feedback: string; source: 'host' | 'attendee' }) => Promise<void>;
}

export const CancelBookingModal: React.FC<CancelBookingModalProps> = ({
  isOpen,
  onClose,
  booking,
  onConfirm,
}) => {
  const [reason, setReason] = useState('Schedule Conflict');
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onConfirm({
        reason,
        feedback,
        source: 'host', // Cancelled by host from dashboard
      });
      onClose();
    } catch (err) {
      console.error('[Cancel Booking Modal Error]:', err);
    } finally {
      setSubmitting(false);
    }
  };

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
            className="relative w-full max-w-md bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl shadow-xl p-6 z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Cancel Appointment
                </h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Are you sure you want to cancel your meeting with <strong>{booking.bookerName}</strong>?
              </p>

              <Select
                label="Reason for Cancellation"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                options={[
                  { value: 'Schedule Conflict', label: 'Schedule Conflict' },
                  { value: 'Double Booked', label: 'Double Booked / Slot Overlap' },
                  { value: 'Holiday / Vacation Block', label: 'Holiday / Vacation Block' },
                  { value: 'Attendee Requested Cancellation', label: 'Attendee Requested Cancellation' },
                  { value: 'Other / Custom Reason', label: 'Other / Custom Reason' },
                ]}
                id="cancel-reason"
              />

              <div className="flex flex-col gap-1.5">
                <label htmlFor="cancel-feedback" className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                  Optional feedback message for guest attendee
                </label>
                <textarea
                  id="cancel-feedback"
                  placeholder="e.g. Sorry, something came up! Let's reschedule for later next week."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:border-black focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:text-white min-h-[80px]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="outline" size="sm" type="button" onClick={onClose}>
                  Keep booking
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  type="submit"
                  loading={submitting}
                  className="bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300 dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-950/30 font-bold"
                >
                  Cancel booking
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CancelBookingModal;
