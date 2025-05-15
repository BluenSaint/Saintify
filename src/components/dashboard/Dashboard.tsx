import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { AnalyticsService } from "@/lib/analytics/analyticsService";
import { Platform } from "@/lib/platforms/basePlatform";
import { useRef, useState, useEffect } from "react";

interface AnalyticsStats {
  totalPosts: number;
  totalEngagement: number;
  averageEngagement: number;
  bestPerformingPost: {
    platform: Platform;
    content: string;
    engagement: number;
    timestamp: Date;
  };
}

export function Dashboard() {
  const { toast } = useToast();
  const analyticsService = new AnalyticsService();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const stats = await analyticsService.getAnalyticsStats();
        setStats(stats);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch analytics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      await analyticsService.generateReport();
      toast({
        title: "Success",
        description: "Analytics report generated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gold-600">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Posts</p>
              <p className="text-2xl font-bold">{stats?.totalPosts}</p>
            </div>
            <div className="text-gold-500">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Engagement</p>
              <p className="text-2xl font-bold">{stats?.totalEngagement}</p>
            </div>
            <div className="text-gold-500">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Engagement</p>
              <p className="text-2xl font-bold">{stats?.averageEngagement.toFixed(2)}%</p>
            </div>
            <div className="text-gold-500">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Best Post</p>
              <p className="text-2xl font-bold">
                {stats?.bestPerformingPost.platform.toUpperCase()}
              </p>
            </div>
            <div className="text-gold-500">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Recent Activity</h3>
        {/* TODO: Implement recent activity list */}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleGenerateReport}
          className="bg-gold-500 hover:bg-gold-600"
        >
          Generate Report
        </Button>
      </div>
    </div>
  );
}
