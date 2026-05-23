'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/layout/PageContainer';
import AvailabilityForm from '../../components/forms/AvailabilityForm';
import { Loader } from '../../components/ui/Loader';
import { apiClient } from '../../services/apiClient';

const WEEKDAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Custom toast notification banner state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  const loadAvailability = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/availability');
      const data = res.data.data;
      
      // If host has availability templates, load them
      if (data && data.length > 0) {
        const record = data[0];
        const mappedSlots = WEEKDAY_NAMES.map((name, index) => {
          const ws = record.weeklySlots?.find((s: any) => s.dayOfWeek === index);
          return {
            weekday: name,
            startTime: ws ? ws.startTime : '09:00',
            endTime: ws ? ws.endTime : '17:00',
            isActive: ws ? !!ws.active : false,
          };
        });
        setAvailability({
          ...record,
          slots: mappedSlots,
        });
      } else {
        // Fallback default setup to satisfy page load
        setAvailability({
          timezone: 'Asia/Kolkata',
          slots: [
            { weekday: 'monday', startTime: '09:00', endTime: '17:00', isActive: true },
            { weekday: 'tuesday', startTime: '09:00', endTime: '17:00', isActive: true },
            { weekday: 'wednesday', startTime: '09:00', endTime: '17:00', isActive: true },
            { weekday: 'thursday', startTime: '09:00', endTime: '17:00', isActive: true },
            { weekday: 'friday', startTime: '09:00', endTime: '17:00', isActive: true },
            { weekday: 'saturday', startTime: '09:00', endTime: '17:00', isActive: false },
            { weekday: 'sunday', startTime: '09:00', endTime: '17:00', isActive: false },
          ],
        });
      }
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load scheduling availability settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAvailability();
  }, []);

  const handleSaveAvailability = async (formData: any) => {
    try {
      const id = availability?.id || availability?._id;
      const weeklySlots = formData.slots.map((s: any) => ({
        dayOfWeek: WEEKDAY_NAMES.indexOf(s.weekday.toLowerCase()),
        startTime: s.startTime,
        endTime: s.endTime,
        active: s.isActive,
      }));

      const payload = {
        timezone: formData.timezone,
        weeklySlots,
        dateOverrides: formData.dateOverrides || [],
      };

      if (id) {
        // Update existing availability template
        await apiClient.put(`/availability/${id}`, payload);
      } else {
        // Create new availability template
        await apiClient.post('/availability', payload);
      }
      showToast('Availability settings updated successfully.', 'success');
      await loadAvailability();
    } catch (err: any) {
      console.error(err);
      showToast(err.response?.data?.message || 'Failed to save availability configurations.', 'error');
      throw err;
    }
  };

  return (
    <DashboardLayout>
      <PageContainer>
        {/* Toast Alert */}
        {toast.show && (
          <div className={`fixed top-4 right-4 z-50 flex items-center px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900'
              : 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-900'
          }`}>
            <span className="text-xs font-semibold">{toast.message}</span>
          </div>
        )}

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Availability
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Configure your default working hours and recurring weekly scheduling availabilities.
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 bg-white border border-gray-150 rounded-2xl dark:bg-gray-900 dark:border-gray-800/80">
              <Loader size="lg" />
            </div>
          ) : (
            <AvailabilityForm
              initialAvailability={availability}
              onSave={handleSaveAvailability}
            />
          )}
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
