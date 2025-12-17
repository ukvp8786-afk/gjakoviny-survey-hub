import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus, Loader2 } from "lucide-react";

interface Question {
  id?: string;
  question_text: string;
  question_type: "radio" | "checkbox" | "text" | "rating" | "scale";
  options: string[] | { min: number; max: number } | null;
  is_required: boolean;
  order_index: number;
}

interface QuestionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: Omit<Question, "id">) => Promise<void>;
  question?: Question | null;
  nextOrderIndex: number;
}

export function QuestionFormDialog({
  open,
  onOpenChange,
  onSave,
  question,
  nextOrderIndex,
}: QuestionFormDialogProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Omit<Question, "id">>({
    question_text: "",
    question_type: "radio",
    options: ["Možnost 1", "Možnost 2"],
    is_required: true,
    order_index: nextOrderIndex,
  });

  const [optionsList, setOptionsList] = useState<string[]>(["Možnost 1", "Možnost 2"]);
  const [scaleMin, setScaleMin] = useState(1);
  const [scaleMax, setScaleMax] = useState(10);

  // Reset form when question changes or dialog opens
  useEffect(() => {
    if (open) {
      if (question) {
        setFormData({
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options,
          is_required: question.is_required,
          order_index: question.order_index,
        });
        if (Array.isArray(question.options)) {
          setOptionsList(question.options);
        } else if (question.question_type === "scale" && question.options) {
          const scaleOpts = question.options as { min: number; max: number };
          setScaleMin(scaleOpts.min || 1);
          setScaleMax(scaleOpts.max || 10);
        } else {
          setOptionsList(["Možnost 1", "Možnost 2"]);
        }
      } else {
        setFormData({
          question_text: "",
          question_type: "radio",
          options: ["Možnost 1", "Možnost 2"],
          is_required: true,
          order_index: nextOrderIndex,
        });
        setOptionsList(["Možnost 1", "Možnost 2"]);
        setScaleMin(1);
        setScaleMax(10);
      }
    }
  }, [open, question, nextOrderIndex]);

  const handleTypeChange = (type: Question["question_type"]) => {
    setFormData({ ...formData, question_type: type });
    if (type === "radio" || type === "checkbox") {
      setOptionsList(["Možnost 1", "Možnost 2"]);
    }
  };

  const handleAddOption = () => {
    setOptionsList([...optionsList, `Možnost ${optionsList.length + 1}`]);
  };

  const handleRemoveOption = (index: number) => {
    setOptionsList(optionsList.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...optionsList];
    newOptions[index] = value;
    setOptionsList(newOptions);
  };

  const handleSubmit = async () => {
    if (!formData.question_text.trim()) return;

    setSaving(true);
    try {
      let options = null;
      if (formData.question_type === "radio" || formData.question_type === "checkbox") {
        options = optionsList.filter((o) => o.trim());
      } else if (formData.question_type === "scale") {
        options = { min: scaleMin, max: scaleMax };
      }

      await onSave({
        ...formData,
        options,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const needsOptions = formData.question_type === "radio" || formData.question_type === "checkbox";
  const needsScale = formData.question_type === "scale";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {question ? "Upravit otázku" : "Nová otázka"}
          </DialogTitle>
          <DialogDescription className="font-body">
            {question ? "Uprav pole níže a ulož změny." : "Vyplň pole pro vytvoření nové otázky."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="font-body">Text otázky</Label>
            <Textarea
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              placeholder="Zadej text otázky..."
              className="font-body"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-body">Typ odpovědi</Label>
            <Select value={formData.question_type} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="radio">Jedna odpověď (radio)</SelectItem>
                <SelectItem value="checkbox">Více odpovědí (checkbox)</SelectItem>
                <SelectItem value="text">Volný text</SelectItem>
                <SelectItem value="rating">Hvězdičkové hodnocení (1-5)</SelectItem>
                <SelectItem value="scale">Škála</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {needsOptions && (
            <div className="space-y-2">
              <Label className="font-body">Možnosti odpovědí</Label>
              <div className="space-y-2">
                {optionsList.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`Možnost ${index + 1}`}
                      className="font-body"
                    />
                    {optionsList.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddOption}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-1" />
                Přidat možnost
              </Button>
            </div>
          )}

          {needsScale && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-body">Minimum</Label>
                <Input
                  type="number"
                  value={scaleMin}
                  onChange={(e) => setScaleMin(parseInt(e.target.value) || 1)}
                  className="font-body"
                />
              </div>
              <div className="space-y-2">
                <Label className="font-body">Maximum</Label>
                <Input
                  type="number"
                  value={scaleMax}
                  onChange={(e) => setScaleMax(parseInt(e.target.value) || 10)}
                  className="font-body"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="font-body">Pořadí</Label>
            <Input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
              className="font-body"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="font-body">Povinná otázka</Label>
            <Switch
              checked={formData.is_required}
              onCheckedChange={(checked) => setFormData({ ...formData, is_required: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Zrušit
            </Button>
            <Button
              variant="hero"
              onClick={handleSubmit}
              disabled={saving || !formData.question_text.trim()}
              className="flex-1"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {question ? "Uložit změny" : "Vytvořit"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
