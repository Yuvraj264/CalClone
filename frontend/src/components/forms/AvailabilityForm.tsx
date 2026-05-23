import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import dayjs from 'dayjs';

interface AvailabilityFormProps {
  initialAvailability: {
    id?: string;
    _id?: string;
    timezone?: string;
    slots: {
      weekday: string;
      startTime: string;
      endTime: string;
      isActive: boolean;
    }[];
    dateOverrides?: {
      date: string;
      startTime: string;
      endTime: string;
      blocked: boolean;
    }[];
  };
  onSave: (data: any) => Promise<void>;
}

export const AvailabilityForm: React.FC<AvailabilityFormProps> = ({
  initialAvailability,
  onSave,
}) => {
  const [timezone, setTimezone] = useState(initialAvailability?.timezone || 'Asia/Kolkata');
  const [slots, setSlots] = useState(initialAvailability?.slots || []);
  const [dateOverrides, setDateOverrides] = useState<any[]>(initialAvailability?.dateOverrides || []);
  const [submitting, setSubmitting] = useState(false);

  // New Override State Form Fields
  const [newDate, setNewDate] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('17:00');
  const [newBlocked, setNewBlocked] = useState(false);

  const handleToggleDay = (index: number) => {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i === index) {
          return { ...slot, isActive: !slot.isActive };
        }
        return slot;
      })
    );
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    setSlots((prev) =>
      prev.map((slot, i) => {
        if (i === index) {
          return { ...slot, [field]: value };
        }
        return slot;
      })
    );
  };

  const handleAddOverride = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!newDate) return;
    
    // Avoid double override entries for same date
    if (dateOverrides.some((o) => o.date === newDate)) return;

    setDateOverrides((prev) => [
      ...prev,
      {
        date: newDate,
        startTime: newBlocked ? '09:00' : newStart,
        endTime: newBlocked ? '17:00' : newEnd,
        blocked: newBlocked,
      },
    ]);

    setNewDate('');
    setNewBlocked(false);
  };

  const handleDeleteOverride = (e: React.MouseEvent, dateToDelete: string) => {
    e.preventDefault();
    setDateOverrides((prev) => prev.filter((o) => o.date !== dateToDelete));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSave({
        timezone,
        slots,
        dateOverrides,
      });
    } catch (err) {
      console.error('Failed to update availability form:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Timezone Select */}
      <div className="bg-white border border-gray-150 p-6 rounded-2xl dark:bg-gray-900 dark:border-gray-800/80">
        <Select
          label="Scheduling Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          options={[
            { value: 'Asia/Kolkata', label: 'India Standard Time (Asia/Kolkata)' },
            { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
            { value: 'America/New_York', label: 'Eastern Standard Time (America/New_York)' },
            { value: 'Europe/London', label: 'Greenwich Mean Time (Europe/London)' },
          ]}
          id="timezone-picker"
        />
      </div>

      {/* Weekday Configuration Rows */}
      <div className="bg-white border border-gray-150 rounded-2xl dark:bg-gray-900 dark:border-gray-800/80 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/40">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Active Hours</h3>
          <p className="text-xs text-gray-500">Configure weekly recurring working hours.</p>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {slots.map((slot, index) => (
            <div key={slot.weekday} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-dashed border-gray-100 dark:border-gray-800/50 last:border-b-0">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`day-${slot.weekday}`}
                  checked={slot.isActive}
                  onChange={() => handleToggleDay(index)}
                  className="h-4.5 w-4.5 rounded border-gray-300 text-black focus:ring-black dark:border-gray-700 dark:bg-gray-800"
                />
                <label
                  htmlFor={`day-${slot.weekday}`}
                  className="text-xs font-semibold text-gray-900 dark:text-white capitalize w-20"
                >
                  {slot.weekday}
                </label>
              </div>

              {slot.isActive ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={slot.startTime}
                    onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                    className="w-20 px-2 py-1 text-xs text-center"
                    placeholder="09:00"
                  />
                  <span className="text-xs text-gray-400">to</span>
                  <Input
                    type="text"
                    value={slot.endTime}
                    onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                    className="w-20 px-2 py-1 text-xs text-center"
                    placeholder="17:00"
                  />
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">Unavailable</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Date Overrides & Vacation Dates widget */}
      <div className="bg-white border border-gray-150 rounded-2xl dark:bg-gray-900 dark:border-gray-800/80 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/40">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Date Overrides & Vacation Dates</h3>
          <p className="text-xs text-gray-500">Block vacation days or specify custom hours for particular calendar dates.</p>
        </div>

        <div className="p-6 flex flex-col gap-6">
          {/* Override Creator Row */}
          <div className="flex flex-col md:flex-row items-end gap-4 p-4 bg-gray-50 rounded-xl dark:bg-gray-800/20 border border-gray-100 dark:border-gray-800/50">
            <div className="flex-1 flex flex-col gap-1.5 w-full">
              <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Target Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-black dark:border-gray-800 dark:bg-gray-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 py-2.5">
              <input
                type="checkbox"
                id="override-blocked"
                checked={newBlocked}
                onChange={(e) => setNewBlocked(e.target.checked)}
                className="h-4.5 w-4.5 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="override-blocked" className="text-xs font-semibold text-gray-700 dark:text-gray-300 select-none">
                Fully Blocked (Vacation / Holiday)
              </label>
            </div>

            {!newBlocked && (
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">Start Time</label>
                  <input
                    type="text"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-20 px-2 py-1.5 text-xs text-center border border-gray-200 rounded-xl focus:outline-none dark:border-gray-800 dark:bg-gray-900"
                    placeholder="09:00"
                  />
                </div>
                <span className="text-xs text-gray-400 mt-5">to</span>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-gray-700 dark:text-gray-300">End Time</label>
                  <input
                    type="text"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-20 px-2 py-1.5 text-xs text-center border border-gray-200 rounded-xl focus:outline-none dark:border-gray-800 dark:bg-gray-900"
                    placeholder="17:00"
                  />
                </div>
              </div>
            )}

            <Button variant="outline" size="sm" type="button" onClick={handleAddOverride} className="w-full md:w-auto">
              Add Override
            </Button>
          </div>

          {/* List of Active Overrides */}
          {dateOverrides.length === 0 ? (
            <p className="text-xs text-gray-400 italic">No date overrides configured yet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {dateOverrides.map((override) => (
                <div
                  key={override.date}
                  className="flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm dark:bg-gray-900 dark:border-gray-800"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {dayjs(override.date).format('MMMM D, YYYY')}
                    </span>
                    <span className="text-[10px] font-medium text-gray-500">
                      {override.blocked ? (
                        <span className="text-rose-600 font-semibold dark:text-rose-400">🛑 Fully Blocked (Vacation)</span>
                      ) : (
                        `Active Hours: ${override.startTime} to ${override.endTime}`
                      )}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleDeleteOverride(e, override.date)}
                    className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button type="submit" loading={submitting}>
          Save availability
        </Button>
      </div>
    </form>
  );
};

export default AvailabilityForm;
