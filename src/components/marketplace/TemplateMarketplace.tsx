import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Template {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  previewUrl: string;
}

export function TemplateMarketplace() {
  const { toast } = useToast();

  const templates: Template[] = [
    {
      id: "1",
      name: "Sacred Content Blueprint",
      description: "AI-powered content generation template with divine tone",
      price: 49.99,
      rating: 4.8,
      previewUrl: "/templates/sacred-content-preview.png",
    },
    {
      id: "2",
      name: "Engagement Halo Template",
      description: "Maximize engagement with this proven content structure",
      price: 39.99,
      rating: 4.9,
      previewUrl: "/templates/engagement-halo-preview.png",
    },
    // Add more templates
  ];

  const handlePurchase = async (template: Template) => {
    try {
      // TODO: Implement purchase logic
      toast({
        title: "Purchase Successful",
        description: `You've purchased the ${template.name} template`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to purchase template",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gold-600">Template Marketplace</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="space-y-4">
              <div className="relative aspect-video w-full">
                <img
                  src={template.previewUrl}
                  alt={template.name}
                  className="object-cover rounded-lg"
                />
              </div>
              <h3 className="text-xl font-semibold">{template.name}</h3>
              <p className="text-gray-600">{template.description}</p>
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <span className="text-sm">{template.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-2xl font-bold text-gold-600">
                  ${template.price}
                </span>
                <Button
                  onClick={() => handlePurchase(template)}
                  className="bg-gold-500 hover:bg-gold-600"
                >
                  Purchase
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
