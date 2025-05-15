import { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Platform } from "@/lib/platforms/basePlatform";

interface Schedule {
  id: string;
  content: string;
  platform: Platform;
  scheduledTime: Date;
  status: "pending" | "completed" | "failed";
}

export function ContentScheduler() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [schedules, setSchedules] = useState<Schedule[]>([]);

  const platforms: { value: Platform; label: string }[] = [
    { value: "instagram", label: "Instagram" },
    { value: "threads", label: "Threads" },
    { value: "tiktok", label: "TikTok" },
    { value: "twitter", label: "Twitter" },
  ];

  useEffect(() => {
    // Load existing schedules
    const savedSchedules = localStorage.getItem("schedules");
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  const handleSchedule = async () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Content cannot be empty",
        variant: "destructive",
      });
      return;
    }

    const newSchedule: Schedule = {
      id: crypto.randomUUID(),
      content,
      platform,
      scheduledTime: selectedDate,
      status: "pending",
    };

    setSchedules((prev) => [...prev, newSchedule]);
    localStorage.setItem("schedules", JSON.stringify([...schedules, newSchedule]));

    toast({
      title: "Scheduled Successfully",
      description: `Content scheduled for ${selectedDate.toLocaleString()}`,
    });

    // Reset form
    setContent("");
    setSelectedDate(new Date());
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    localStorage.setItem("schedules", JSON.stringify(schedules.filter((s) => s.id !== id)));
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gold-600">Content Scheduler</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Platform
          </label>
          <Select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as Platform)}
          >
            {platforms.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Select Date
          </label>
          <Calendar
            value={selectedDate}
            onChange={setSelectedDate}
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your content here..."
            className="min-h-[200px]"
          />
        </div>

        <Button onClick={handleSchedule} className="bg-gold-500 hover:bg-gold-600">
          Schedule Content
        </Button>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Scheduled Posts</h3>
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
            >
              <div>
                <p className="font-medium">
                  {schedule.content.substring(0, 50)}...
                </p>
                <p className="text-sm text-gray-500">
                  {schedule.platform} - {schedule.scheduledTime.toLocaleString()}
                </p>
                <p className="text-sm">
                  Status: {schedule.status}
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(schedule.id)}
              >
                Delete
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
