'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageContainer from '../../components/layout/PageContainer';
import { Loader } from '../../components/ui/Loader';
import { Calendar, CheckCircle2, XCircle, TrendingUp, BarChart3 } from 'lucide-react';
import { apiClient } from '../../services/apiClient';
import { motion } from 'framer-motion';

export default function AnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/bookings/analytics');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('[Analytics Fetch Fail]:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <PageContainer>
          <div className="flex items-center justify-center py-40">
            <Loader size="lg" />
          </div>
        </PageContainer>
      </DashboardLayout>
    );
  }

  // Fallback defaults if database has no active logs
  const stats = [
    {
      name: 'Total Bookings',
      value: data?.totalBookings || 0,
      icon: Calendar,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400',
    },
    {
      name: 'Completed Calls',
      value: data?.completedMeetings || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400',
    },
    {
      name: 'Cancellation Rate',
      value: `${data?.cancellationRate || 0}%`,
      icon: XCircle,
      color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20 dark:text-rose-400',
    },
  ];

  const busiestDays = data?.busiestDays || [];
  const maxDayCount = Math.max(...busiestDays.map((d: any) => d.count), 1);

  const trends = data?.trends || [];
  const maxTrendCount = Math.max(...trends.map((t: any) => t.count), 1);

  return (
    <DashboardLayout>
      <PageContainer>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Analytics
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Review meeting conversions, booking slots usage, and weekly frequency aggregates.
            </p>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800/80 flex items-center gap-4"
              >
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Visual Charts Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekday distribution Bar Chart */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800/80 flex flex-col gap-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span>Busiest Booking Weekdays</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Distribution of scheduling traffic across weekdays.</p>
              </div>

              {busiestDays.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-10 text-center">No weekday booking distributions loaded.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {busiestDays.map((dayData: any, index: number) => {
                    const widthPercent = `${Math.max((dayData.count / maxDayCount) * 100, 3)}%`;
                    return (
                      <div key={dayData.day} className="flex items-center gap-4">
                        <span className="w-20 text-xs font-semibold text-gray-500 capitalize">{dayData.day}</span>
                        <div className="flex-1 bg-gray-100 dark:bg-gray-850 h-5.5 rounded-lg overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: widthPercent }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
                            className="bg-black dark:bg-white h-full rounded-lg"
                          />
                        </div>
                        <span className="w-8 text-right text-xs font-bold text-gray-900 dark:text-white">
                          {dayData.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Monthly trend Line Chart */}
            <motion.div
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm dark:bg-gray-900 dark:border-gray-800/80 flex flex-col gap-6"
            >
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-gray-400" />
                  <span>Monthly Booking Trends</span>
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Performance tracking and volume trends over past months.</p>
              </div>

              {trends.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-10 text-center">No trend logs loaded yet.</p>
              ) : (
                <div className="flex flex-col justify-end h-56 pt-6">
                  <div className="flex-1 flex items-end justify-between gap-6 border-b border-gray-100 dark:border-gray-800 pb-2">
                    {trends.map((t: any, index: number) => {
                      const heightPercent = `${Math.max((t.count / maxTrendCount) * 80, 10)}%`;
                      return (
                        <div key={t.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                          <div className="text-[10px] font-bold text-gray-400">{t.count}</div>
                          <div className="w-full bg-gray-50 dark:bg-gray-850 h-full rounded-xl flex items-end relative overflow-hidden">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: heightPercent }}
                              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
                              className="w-full bg-gradient-to-t from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 rounded-xl"
                            />
                          </div>
                          <span className="text-[10px] font-semibold text-gray-500">{t.month}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </PageContainer>
    </DashboardLayout>
  );
}
