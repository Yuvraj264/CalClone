'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/layout/PageContainer';
import EventTypeCard from '../../components/dashboard/EventTypeCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { EmptyState } from '../../components/ui/EmptyState';
import { Link2 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

export default function EventTypesDashboard() {
  const [eventTypes, setEventTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // New Event Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [duration, setDuration] = useState(15);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
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

  const loadEventTypes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/event-types');
      setEventTypes(res.data.data || []);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to load event templates.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEventTypes();
  }, []);

  const handleCopyLink = (slugPath: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    navigator.clipboard.writeText(`${origin}/book/${slugPath}`);
    setCopiedSlug(slugPath);
    showToast('Event booking link copied to clipboard.', 'success');
    setTimeout(() => setCopiedSlug(null), 3000);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Title is required.');
      return;
    }
    if (!slug.trim() || !/^[a-z0-9-]+$/.test(slug)) {
      setFormError('Slug must contain only lowercase letters, numbers, and hyphens.');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post('/event-types', {
        title,
        slug: slug.toLowerCase(),
        duration,
        timezone,
        description: `This is a custom ${duration} minute meeting.`,
        isActive: true,
      });

      showToast('Event type created successfully.', 'success');
      setIsModalOpen(false);
      
      // Clear form
      setTitle('');
      setSlug('');
      setDuration(15);
      
      // Refresh list
      await loadEventTypes();
    } catch (err: any) {
      console.error(err);
      setFormError(err.response?.data?.message || 'Failed to create event template.');
    } finally {
      setSubmitting(false);
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
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Event Types
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create templates for your event slots that guest attendees can book.
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>Create event type</Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-2xl border border-gray-150 dark:border-gray-800/80" />
              ))}
            </div>
          ) : eventTypes.length === 0 ? (
            <EmptyState
              title="No event templates found"
              description="Create your first reusable event template type so that others can schedule appointments with you."
              icon={<Link2 className="w-6 h-6" />}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventTypes.map((et) => (
                <EventTypeCard
                  key={et.id || et._id}
                  eventType={et}
                  onCopyLink={handleCopyLink}
                  copiedSlug={copiedSlug}
                />
              ))}
            </div>
          )}
        </div>

        {/* Create Event Type Modal Overlay */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Create a new event template"
        >
          <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
            <Input
              label="Title"
              placeholder="e.g. 15-Minute Sync"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="event-title"
              required
            />

            <Input
              label="Slug URL path"
              placeholder="e.g. 15-min-sync"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              id="event-slug"
              required
            />

            <Select
              label="Duration"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              options={[
                { value: 15, label: '15 minutes' },
                { value: 30, label: '30 minutes' },
                { value: 45, label: '45 minutes' },
                { value: 60, label: '60 minutes' },
              ]}
              id="event-duration"
            />

            <Select
              label="Timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              options={[
                { value: 'Asia/Kolkata', label: 'India Standard Time (Asia/Kolkata)' },
                { value: 'UTC', label: 'Coordinated Universal Time (UTC)' },
                { value: 'America/New_York', label: 'Eastern Standard Time (America/New_York)' },
                { value: 'Europe/London', label: 'Greenwich Mean Time (Europe/London)' },
              ]}
              id="event-timezone"
            />

            {formError && (
              <span className="text-[11px] font-semibold text-rose-600">
                {formError}
              </span>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" type="submit" loading={submitting}>
                Create
              </Button>
            </div>
          </form>
        </Modal>
      </PageContainer>
    </DashboardLayout>
  );
}
