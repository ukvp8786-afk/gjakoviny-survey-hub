import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Newspaper, LogOut, Users, MessageSquare, BarChart3, 
  Loader2, Star, ChevronDown, ChevronUp 
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[] | { min: number; max: number } | null;
  order_index: number;
}

interface Answer {
  id: string;
  question_id: string;
  answer_value: string | null;
  answer_array: unknown;
  response_id: string;
}

interface ResponseData {
  id: string;
  submitted_at: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  useEffect(() => {
    // Check auth
    const isAuth = sessionStorage.getItem("gjak_admin_auth");
    if (!isAuth) {
      navigate("/admin");
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [questionsRes, answersRes, responsesRes] = await Promise.all([
        supabase.from("questions").select("*").order("order_index"),
        supabase.from("answers").select("*"),
        supabase.from("survey_responses").select("*").order("submitted_at", { ascending: false }),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      if (answersRes.error) throw answersRes.error;
      if (responsesRes.error) throw responsesRes.error;

      const parsedQuestions = questionsRes.data?.map((q) => ({
        ...q,
        options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : null,
      })) || [];

      setQuestions(parsedQuestions);
      setAnswers(answersRes.data || []);
      setResponses(responsesRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Nepodařilo se načíst data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("gjak_admin_auth");
    navigate("/admin");
  };

  const getAnswersForQuestion = (questionId: string) => {
    return answers.filter((a) => a.question_id === questionId);
  };

  const getAnswerStats = (question: Question) => {
    const questionAnswers = getAnswersForQuestion(question.id);
    
    if (question.question_type === "radio") {
      const options = question.options as string[];
      const counts: Record<string, number> = {};
      options?.forEach((opt) => (counts[opt] = 0));
      questionAnswers.forEach((a) => {
        if (a.answer_value && counts[a.answer_value] !== undefined) {
          counts[a.answer_value]++;
        }
      });
      return { type: "radio", data: counts, total: questionAnswers.length };
    }

    if (question.question_type === "checkbox") {
      const options = question.options as string[];
      const counts: Record<string, number> = {};
      options?.forEach((opt) => (counts[opt] = 0));
      questionAnswers.forEach((a) => {
        const selected = a.answer_array as string[] | null;
        selected?.forEach((opt) => {
          if (counts[opt] !== undefined) counts[opt]++;
        });
      });
      return { type: "checkbox", data: counts, total: questionAnswers.length };
    }

    if (question.question_type === "rating") {
      const ratings = questionAnswers.map((a) => parseInt(a.answer_value || "0")).filter((r) => r > 0);
      const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return { type: "rating", average: avg, total: ratings.length };
    }

    if (question.question_type === "scale") {
      const values = questionAnswers.map((a) => parseInt(a.answer_value || "0")).filter((r) => r > 0);
      const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return { type: "scale", average: avg, total: values.length };
    }

    if (question.question_type === "text") {
      return { 
        type: "text", 
        responses: questionAnswers.map((a) => a.answer_value).filter(Boolean),
        total: questionAnswers.filter((a) => a.answer_value).length
      };
    }

    return { type: "unknown", total: 0 };
  };

  const renderStats = (question: Question) => {
    const stats = getAnswerStats(question);

    if (stats.type === "radio" || stats.type === "checkbox") {
      const data = stats.data as Record<string, number>;
      const maxCount = Math.max(...Object.values(data), 1);
      
      return (
        <div className="space-y-3">
          {Object.entries(data).map(([option, count]) => (
            <div key={option} className="space-y-1">
              <div className="flex justify-between text-sm font-body">
                <span className="text-foreground">{option}</span>
                <span className="text-muted-foreground">
                  {count} ({stats.total > 0 ? Math.round((count / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-hero rounded-full transition-all duration-500"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (stats.type === "rating") {
      const avg = stats.average as number;
      return (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={cn(
                  "w-6 h-6",
                  star <= Math.round(avg) ? "fill-primary text-primary" : "text-muted-foreground/30"
                )}
              />
            ))}
          </div>
          <span className="font-display text-2xl font-bold text-foreground">
            {avg.toFixed(1)}
          </span>
          <span className="text-muted-foreground font-body">
            ({stats.total} hodnocení)
          </span>
        </div>
      );
    }

    if (stats.type === "scale") {
      const avg = stats.average as number;
      return (
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full gradient-hero rounded-full transition-all duration-500"
              style={{ width: `${(avg / 10) * 100}%` }}
            />
          </div>
          <span className="font-display text-2xl font-bold text-foreground min-w-[3rem]">
            {avg.toFixed(1)}
          </span>
          <span className="text-muted-foreground font-body">
            ({stats.total} odpovědí)
          </span>
        </div>
      );
    }

    if (stats.type === "text") {
      const textResponses = stats.responses as string[];
      return (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {textResponses.length > 0 ? (
            textResponses.map((response, i) => (
              <div key={i} className="p-3 bg-secondary/50 rounded-lg font-body text-sm">
                "{response}"
              </div>
            ))
          ) : (
            <p className="text-muted-foreground font-body text-sm">Zatím žádné odpovědi</p>
          )}
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-accent text-accent-foreground py-6">
        <div className="container max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Newspaper className="w-6 h-6" />
            <div>
              <h1 className="font-display text-xl font-bold">GJAKoviny</h1>
              <p className="font-body text-sm opacity-90">Administrace průzkumu</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-accent-foreground hover:bg-accent-foreground/10">
            <LogOut className="w-4 h-4" />
            Odhlásit
          </Button>
        </div>
      </header>

      {/* Stats Cards */}
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="shadow-soft border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg gradient-hero flex items-center justify-center">
                <Users className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Celkem odpovědí</p>
                <p className="font-display text-3xl font-bold text-foreground">{responses.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg gradient-accent flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Otázek v průzkumu</p>
                <p className="font-display text-3xl font-bold text-foreground">{questions.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-soft border-0">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-body">Celkem odpovědí</p>
                <p className="font-display text-3xl font-bold text-foreground">{answers.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questions Results */}
        <h2 className="font-display text-2xl font-bold text-foreground mb-6">Výsledky otázek</h2>
        <div className="space-y-4">
          {questions.map((question, index) => {
            const isExpanded = expandedQuestion === question.id;
            return (
              <Card key={question.id} className="shadow-soft border-0 overflow-hidden">
                <button
                  onClick={() => setExpandedQuestion(isExpanded ? null : question.id)}
                  className="w-full text-left"
                >
                  <CardHeader className="flex flex-row items-center justify-between p-6 hover:bg-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        {index + 1}
                      </span>
                      <CardTitle className="font-display text-lg font-medium">
                        {question.question_text}
                      </CardTitle>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </CardHeader>
                </button>
                {isExpanded && (
                  <CardContent className="px-6 pb-6 pt-0">
                    <div className="ml-11">
                      {renderStats(question)}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
