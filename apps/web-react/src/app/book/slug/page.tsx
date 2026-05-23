import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import BookingCalendar from '../../../components/booking/BookingCalendar';
import TimeSlotButton from '../../../components/booking/TimeSlotButton';
import BookingForm from '../../../components/booking/BookingForm';
import { Card } from '../../../components/ui/Card';
import { Loader } from '../../../components/ui/Loader';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Clock, Globe, ArrowLeft } from 'lucide-react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

const API_BASE = import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL.replace('/v1', '') 
  : 'http://localhost:5001/api';

const bookingClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const rescheduleId = searchParams.get('rescheduleId') || '';
  const [rescheduleBooking, setRescheduleBooking] = useState<any>(null);

  const [eventType, setEventType] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [step, setStep] = useState<'datetime' | 'form'>('datetime');

  // Load Event Type Details on load
  useEffect(() => {
    if (!slug) return;
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        // Call backend public single event type resolver
        const res = await bookingClient.get(`/event-types/public/${slug}`);
        
        if (res.data.success && res.data.data) {
          setEventType(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load event settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [slug]);

  // Load reschedule details if rescheduleId query exists
  useEffect(() => {
    if (!rescheduleId) return;
    const fetchRescheduleDetails = async () => {
      try {
        const res = await bookingClient.get(`/bookings/${rescheduleId}`);
        if (res.data.success && res.data.data) {
          setRescheduleBooking(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load rescheduled booking info:', err);
      }
    };
    fetchRescheduleDetails();
  }, [rescheduleId]);

  // Load slots whenever a date is selected
  useEffect(() => {
    if (!selectedDate || !slug) return;

    const fetchAvailableSlots = async () => {
      try {
        setSlotsLoading(true);
        setSelectedTime('');
        const res = await bookingClient.get(`/slots?slug=${slug}&date=${selectedDate}`);
        setSlots(res.data.data.slots || []);
      } catch (err) {
        console.error('Failed to load available slots:', err);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, [selectedDate, slug]);

  const handleBookingSubmit = async (formData: { bookerName: string; bookerEmail: string }) => {
    if (!slug || !eventType) return;
    try {
      const hostTimezone = eventType.userId?.timezone || eventType.timezone || 'Asia/Kolkata';
      const formattedStartTime = dayjs(selectedTime).tz(hostTimezone).format('HH:mm');

      let res;
      if (rescheduleId) {
        // Trigger backend reschedule flow
        res = await bookingClient.patch(`/bookings/${rescheduleId}/reschedule`, {
          date: selectedDate,
          startTime: formattedStartTime,
        });
      } else {
        // Trigger standard booking reservation flow
        res = await bookingClient.post('/bookings', {
          eventTypeSlug: slug,
          bookerName: formData.bookerName,
          bookerEmail: formData.bookerEmail,
          date: selectedDate,
          startTime: formattedStartTime,
        });
      }

      // Store success info to sessionStorage to display on the confirmation page
      sessionStorage.setItem('last_booking_success', JSON.stringify({
        eventTitle: eventType.title,
        bookerName: formData.bookerName || rescheduleBooking?.bookerName || rescheduleBooking?.guestName,
        bookerEmail: formData.bookerEmail || rescheduleBooking?.bookerEmail || rescheduleBooking?.guestEmail,
        date: selectedDate,
        time: selectedTime,
        duration: eventType.duration,
        timezone: eventType.timezone || 'Asia/Kolkata',
        isReschedule: !!rescheduleId,
      }));

      // Redirect guest to Success page
      navigate('/confirmation');
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-black flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!eventType) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-black flex items-center justify-center p-4">
        <EmptyState
          title="Event Link Expired or Not Found"
          description="The scheduling calendar page you requested is not active. Please double check the link URL address path."
          icon={<ArrowLeft className="w-6 h-6" />}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center font-sans">
      <Card className="w-full max-w-4xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 overflow-hidden">
        {/* Host Side Description Panel */}
        <div className="md:w-1/3 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 pb-6 md:pb-0 md:pr-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              {eventType.title}
            </h1>
            <p className="text-xs text-gray-500">
              Host: {eventType.userId?.fullName || eventType.userId?.name || 'User Account'} ({eventType.userId?.email || 'host@calclone.com'})
            </p>
          </div>

          <div className="flex flex-col gap-2.5 mt-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{eventType.duration} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span>{eventType.timezone || 'Asia/Kolkata'} Timezone</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-2 leading-relaxed">
            Welcome! Select a date column and preferred slot time from the schedule selector panel to reserve your appointment.
          </p>
        </div>

        {/* Date Slot Selector Area */}
        <div className="flex-1 flex flex-col gap-6">
          {step === 'datetime' ? (
            <>
              {/* Calendar Days */}
              <BookingCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
              />

              {/* Time Slots grid */}
              {selectedDate && (
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-bold text-gray-900 dark:text-white">
                    Available Slots on {dayjs(selectedDate).format('MMMM D, YYYY')}:
                  </h4>

                  {slotsLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl" />
                      ))}
                    </div>
                  ) : slots.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">
                      No bookable time slots generated on this day. Please choose another date.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {slots.map((time) => (
                        <TimeSlotButton
                          key={time}
                          time={time}
                          selectedTime={selectedTime}
                          onSelectTime={setSelectedTime}
                        />
                      ))}
                    </div>
                  )}

                  {/* Next Step confirmation */}
                  {selectedTime && (
                    <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-2">
                      <button
                        onClick={() => setStep('form')}
                        className="px-5 py-2.5 text-xs font-semibold bg-black text-white hover:bg-gray-800 rounded-xl transition-all duration-150"
                      >
                        Next: Add details
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <BookingForm
              date={selectedDate}
              time={selectedTime}
              onSubmit={handleBookingSubmit}
              onBack={() => setStep('datetime')}
              initialName={rescheduleBooking?.bookerName || rescheduleBooking?.guestName}
              initialEmail={rescheduleBooking?.bookerEmail || rescheduleBooking?.guestEmail}
              isReschedule={!!rescheduleId}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
