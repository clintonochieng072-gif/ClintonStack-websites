"use client";

import React, { useState, useEffect } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Globe, Clock, Calendar } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function PublishSettingsPage() {
  const { data: siteData, mutate: mutateSite } = useSWR(
    "/api/site/me",
    fetcher
  );
  const { data: scheduleData, mutate: mutateSchedule } = useSWR(
    "/api/site/publish/schedule",
    fetcher
  );

  const [scheduleForm, setScheduleForm] = useState({
    enabled: false,
    frequency: "daily",
    time: "09:00",
    dayOfWeek: 1,
    dayOfMonth: 1,
  });
  const [savingSchedule, setSavingSchedule] = useState(false);

  const site = siteData?.data;
  const isPublished = site?.published;
  const schedule = scheduleData?.data;

  useEffect(() => {
    if (schedule) {
      setScheduleForm({
        enabled: schedule.enabled || false,
        frequency: schedule.frequency || "daily",
        time: schedule.time || "09:00",
        dayOfWeek: schedule.dayOfWeek || 1,
        dayOfMonth: schedule.dayOfMonth || 1,
      });
    }
  }, [schedule]);

  const handleSaveSchedule = async () => {
    setSavingSchedule(true);
    try {
      const response = await fetch("/api/site/publish/schedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scheduleForm),
      });

      if (response.ok) {
        mutateSchedule();
        alert("Auto-publish schedule updated successfully!");
      } else {
        alert("Failed to update schedule");
      }
    } catch (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule");
    } finally {
      setSavingSchedule(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Publish Website
        </h2>
        <p className="text-gray-600">
          Make your website live for the world to see
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="w-5 h-5" />
            <span>Publication Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {isPublished ? "Website is Live" : "Website is in Draft"}
              </h3>
              <p className="text-gray-600">
                {isPublished
                  ? "Your website is currently published and visible to visitors."
                  : "Your website is in draft mode and not visible to the public."}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                isPublished
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-600">
              Use the Publish button in the header to publish your changes.
            </p>
          </div>

          {isPublished && site?.slug && (
            <div className="p-4 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Your website is live at:</strong>{" "}
                <a
                  href={`${process.env.NEXT_PUBLIC_PUBLIC_URL}/site/${site.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  {process.env.NEXT_PUBLIC_PUBLIC_URL}/site/{site.slug}
                </a>
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auto-Publish Scheduling */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Auto-Publish Scheduling</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="autoPublish"
              checked={scheduleForm.enabled}
              onChange={(e) =>
                setScheduleForm((prev) => ({
                  ...prev,
                  enabled: e.target.checked,
                }))
              }
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label
              htmlFor="autoPublish"
              className="text-sm font-medium text-gray-900"
            >
              Enable automatic publishing
            </label>
          </div>

          {scheduleForm.enabled && (
            <div className="space-y-4 pl-7">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Frequency
                  </label>
                  <select
                    value={scheduleForm.frequency}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        frequency: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={scheduleForm.time}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        time: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {scheduleForm.frequency === "weekly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Week
                  </label>
                  <select
                    value={scheduleForm.dayOfWeek}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        dayOfWeek: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={0}>Sunday</option>
                    <option value={1}>Monday</option>
                    <option value={2}>Tuesday</option>
                    <option value={3}>Wednesday</option>
                    <option value={4}>Thursday</option>
                    <option value={5}>Friday</option>
                    <option value={6}>Saturday</option>
                  </select>
                </div>
              )}

              {scheduleForm.frequency === "monthly" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Day of Month
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={scheduleForm.dayOfMonth}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        dayOfMonth: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              )}

              {schedule?.nextPublish && (
                <div className="p-4 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Next auto-publish:</strong>{" "}
                    {new Date(schedule.nextPublish).toLocaleString()}
                  </p>
                </div>
              )}

              <Button
                onClick={handleSaveSchedule}
                disabled={savingSchedule}
                className="w-full sm:w-auto"
              >
                {savingSchedule ? "Saving..." : "Save Schedule"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
