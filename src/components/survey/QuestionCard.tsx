import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question_text: string;
  question_type: "radio" | "checkbox" | "text" | "rating" | "scale";
  options: string[] | { min: number; max: number } | null;
  is_required: boolean;
  order_index: number;
}

interface QuestionCardProps {
  question: Question;
  value: string | string[] | number;
  onChange: (value: string | string[] | number) => void;
  index: number;
}

export function QuestionCard({ question, value, onChange, index }: QuestionCardProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const renderInput = () => {
    switch (question.question_type) {
      case "radio":
        const radioOptions = question.options as string[];
        return (
          <RadioGroup
            value={value as string}
            onValueChange={onChange}
            className="space-y-3"
          >
            {radioOptions?.map((option, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border border-border/50 transition-all duration-200 cursor-pointer hover:bg-secondary/50",
                  value === option && "bg-primary/10 border-primary/30"
                )}
                onClick={() => onChange(option)}
              >
                <RadioGroupItem value={option} id={`${question.id}-${i}`} />
                <Label htmlFor={`${question.id}-${i}`} className="cursor-pointer flex-1 font-body">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        const checkboxOptions = question.options as string[];
        const selectedValues = (value as string[]) || [];
        return (
          <div className="space-y-3">
            {checkboxOptions?.map((option, i) => (
              <div
                key={i}
                className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg border border-border/50 transition-all duration-200 cursor-pointer hover:bg-secondary/50",
                  selectedValues.includes(option) && "bg-primary/10 border-primary/30"
                )}
                onClick={() => {
                  const newValue = selectedValues.includes(option)
                    ? selectedValues.filter((v) => v !== option)
                    : [...selectedValues, option];
                  onChange(newValue);
                }}
              >
                <Checkbox
                  checked={selectedValues.includes(option)}
                  id={`${question.id}-${i}`}
                />
                <Label htmlFor={`${question.id}-${i}`} className="cursor-pointer flex-1 font-body">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "text":
        return (
          <Textarea
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Napiš svou odpověď..."
            className="min-h-[120px] resize-none font-body"
          />
        );

      case "rating":
        const rating = (value as number) || 0;
        return (
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-all duration-200 hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => onChange(star)}
              >
                <Star
                  className={cn(
                    "w-10 h-10 transition-colors duration-200",
                    (hoverRating || rating) >= star
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>
        );

      case "scale":
        const scaleOptions = question.options as { min: number; max: number };
        const scaleValue = (value as number) || scaleOptions?.min || 1;
        return (
          <div className="space-y-4 py-4">
            <Slider
              value={[scaleValue]}
              onValueChange={(v) => onChange(v[0])}
              min={scaleOptions?.min || 1}
              max={scaleOptions?.max || 10}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground font-body">
              <span>{scaleOptions?.min || 1}</span>
              <span className="text-lg font-semibold text-primary">{scaleValue}</span>
              <span>{scaleOptions?.max || 10}</span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card 
      className="shadow-card border-0 overflow-hidden animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <span className="flex items-center justify-center w-8 h-8 rounded-full gradient-hero text-primary-foreground text-sm font-semibold shrink-0">
            {index + 1}
          </span>
          <h3 className="font-display text-lg font-medium text-foreground leading-tight pt-1">
            {question.question_text}
            {question.is_required && (
              <span className="text-destructive ml-1">*</span>
            )}
          </h3>
        </div>
        <div className="ml-12">
          {renderInput()}
        </div>
      </CardContent>
    </Card>
  );
}
