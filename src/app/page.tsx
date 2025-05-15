import { SacredLayout } from "@/components/ui/sacredLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Home() {
  const [content, setContent] = useState("");
  const [tone, setTone] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // TODO: Implement content generation
    console.log("Generating content with tone:", tone);
    setLoading(false);
  };

  return (
    <SacredLayout>
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gold-600 mb-2">
            SAINTIFY
          </h1>
          <p className="text-xl text-gray-600">
            Post. Convert. Prosper.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label htmlFor="content">Confession Screen</Label>
            <Textarea
              id="content"
              placeholder="What content sins do you want to absolve?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <Label htmlFor="tone">Tone Consecration</Label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Sacred</span>
              <Slider
                id="tone"
                value={[tone]}
                onValueChange={(value) => setTone(value[0])}
                max={100}
                min={0}
                step={1}
              />
              <span className="text-sm text-gray-500">Mundane</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gold-500 hover:bg-gold-600 text-white font-bold py-3 px-6 rounded-full shadow-lg transition-all duration-300"
            disabled={loading}
          >
            {loading ? "Blessing in Progress..." : "Auto-Bless"}
          </Button>
        </form>

        <div className="text-center text-gray-500">
          <p className="text-sm">
            Your content will be blessed and distributed across all platforms
          </p>
          <p className="text-xs">
            Powered by divine automation and sacred AI
          </p>
        </div>
      </div>
    </SacredLayout>
  );
}
