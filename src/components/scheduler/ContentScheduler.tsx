import { useState, useEffect } from "react";
import { Calendar } from "react-calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectItem } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
type Platform = "instagram" | "threads" | "tiktok" | "twitter";

interface Schedule {
  id: string;
  date: Date;
  platform: Platform;
  content: string;
}

export default function ContentScheduler() {
  const [date, setDate] = useState<Date>(new Date());
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [content, setContent] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing schedules
    const savedSchedules = localStorage.getItem("schedules");
    if (savedSchedules) {
      setSchedules(JSON.parse(savedSchedules));
    }
  }, []);

  const handleSchedule = () => {
    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Please enter content to schedule",
        variant: "destructive",
      });
      return;
    }

    const newSchedule: Schedule = {
      id: crypto.randomUUID(),
      date,
      platform,
      content,
    };

    setSchedules((prev) => [...prev, newSchedule]);
    localStorage.setItem("schedules", JSON.stringify([...schedules, newSchedule]));
    setContent("");
    toast({
      title: "Success",
      description: `Scheduled post for ${date.toLocaleDateString()} on ${platform}`,
    });
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    localStorage.setItem("schedules", JSON.stringify(schedules.filter((s) => s.id !== id)));
  };

  return (
    <div className="space-y-8 p-8">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Schedule Content</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium mb-2">Date</label>
            <Calendar
              value={date}
              onChange={(value) => setDate(value as Date)}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectItem value="instagram">Instagram</SelectItem>
              <SelectItem value="threads">Threads</SelectItem>
              <SelectItem value="tiktok">TikTok</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
            </Select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Content</label>
          <Input
            value={content}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value)}
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
                  {schedule.content.substring(0, 100)}
                  {schedule.content.length > 100 && "..."}
                </p>
                <p className="text-sm text-gray-500">
                  {schedule.date.toLocaleDateString()} on {schedule.platform}
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
