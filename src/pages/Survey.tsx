import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { QuestionCard } from "@/components/survey/QuestionCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Newspaper, Send, Lock, Loader2 } from "lucide-react";
interface Question {
  id: string;
  question_text: string;
  question_type: "radio" | "checkbox" | "text" | "rating" | "scale";
  options: string[] | {
    min: number;
    max: number;
  } | null;
  is_required: boolean;
  order_index: number;
}
export default function Survey() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | string[] | number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    fetchQuestions();
  }, []);
  const fetchQuestions = async () => {
    const {
      data,
      error
    } = await supabase.from("questions").select("*").order("order_index", {
      ascending: true
    });
    if (error) {
      toast.error("Nepodařilo se načíst otázky");
      return;
    }

    // Parse options from JSON
    const parsedQuestions = data?.map(q => ({
      ...q,
      question_type: q.question_type as Question["question_type"],
      options: q.options ? typeof q.options === 'string' ? JSON.parse(q.options) : q.options : null
    })) || [];
    setQuestions(parsedQuestions);
    setLoading(false);
  };
  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  const validateAnswers = () => {
    for (const question of questions) {
      if (question.is_required) {
        const answer = answers[question.id];
        if (!answer || Array.isArray(answer) && answer.length === 0) {
          toast.error(`Prosím odpověz na otázku: "${question.question_text}"`);
          return false;
        }
      }
    }
    return true;
  };
  const handleSubmit = async () => {
    if (!validateAnswers()) return;
    setSubmitting(true);
    try {
      // Create survey response
      const {
        data: responseData,
        error: responseError
      } = await supabase.from("survey_responses").insert({}).select().single();
      if (responseError) throw responseError;

      // Insert all answers
      const answersToInsert = Object.entries(answers).map(([questionId, value]) => ({
        response_id: responseData.id,
        question_id: questionId,
        answer_value: typeof value === "string" || typeof value === "number" ? String(value) : null,
        answer_array: Array.isArray(value) ? value : null
      }));
      const {
        error: answersError
      } = await supabase.from("answers").insert(answersToInsert);
      if (answersError) throw answersError;
      toast.success("Děkujeme za vyplnění průzkumu!");
      navigate("/dekujeme");
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("Nepodařilo se odeslat odpovědi. Zkus to znovu.");
    } finally {
      setSubmitting(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-hero text-primary-foreground py-12 md:py-16">
        <div className="container max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4 animate-fade-in">
            <Newspaper className="w-8 h-8" />
            <span className="font-body text-sm uppercase tracking-wider opacity-90">
              Školní časopis
            </span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4 animate-slide-up">
            GJAKoviny
          </h1>
          <p className="font-body text-lg opacity-90 animate-slide-up" style={{
          animationDelay: "100ms"
        }}>Čtenářský průzkum 2025 – pomozte nám vytvořit ještě lepší časopis!</p>
        </div>
      </header>

      {/* Questions */}
      <main className="container max-w-3xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-6">
          {questions.map((question, index) => <QuestionCard key={question.id} question={question} value={answers[question.id] || (question.question_type === "checkbox" ? [] : "")} onChange={value => handleAnswerChange(question.id, value)} index={index} />)}
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Button variant="hero" size="lg" onClick={handleSubmit} disabled={submitting} className="w-full sm:w-auto">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Odeslat odpovědi
          </Button>

          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="text-muted-foreground">
            <Lock className="w-4 h-4" />
            Přístup pro redakci
          </Button>
        </div>
      </main>
    </div>;
}