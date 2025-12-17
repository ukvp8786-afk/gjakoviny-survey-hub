-- Create enum for question types
CREATE TYPE question_type AS ENUM ('radio', 'checkbox', 'text', 'rating', 'scale');

-- Questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL DEFAULT 'radio',
  options JSONB, -- for radio/checkbox options
  order_index INTEGER NOT NULL DEFAULT 0,
  is_required BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Survey responses table
CREATE TABLE public.survey_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL DEFAULT gen_random_uuid(),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Individual answers
CREATE TABLE public.answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  response_id UUID NOT NULL REFERENCES public.survey_responses(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  answer_value TEXT,
  answer_array JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

-- Public can read questions
CREATE POLICY "Anyone can read questions" ON public.questions FOR SELECT USING (true);

-- Anyone can insert survey responses (anonymous)
CREATE POLICY "Anyone can submit responses" ON public.survey_responses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read their own responses" ON public.survey_responses FOR SELECT USING (true);

-- Anyone can insert answers (anonymous)
CREATE POLICY "Anyone can submit answers" ON public.answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read answers" ON public.answers FOR SELECT USING (true);

-- Insert sample questions
INSERT INTO public.questions (question_text, question_type, options, order_index, is_required) VALUES
('Jak často čteš GJAKoviny?', 'radio', '["Každé vydání", "Občas", "Zřídka", "Toto je moje první"]', 1, true),
('Co tě na časopise nejvíc baví?', 'checkbox', '["Rozhovory", "Recenze", "Školní akce", "Soutěže", "Fotogalerie", "Kreativní tvorba"]', 2, true),
('Ohodnoť celkovou kvalitu časopisu (1-5 hvězdiček)', 'rating', null, 3, true),
('Jaké téma by tě zajímalo v příštím vydání?', 'text', null, 4, false),
('Jak hodnotíš grafickou úpravu? (1 = špatná, 10 = výborná)', 'scale', '{"min": 1, "max": 10}', 5, true),
('Doporučil/a bys GJAKoviny spolužákům?', 'radio', '["Rozhodně ano", "Spíše ano", "Spíše ne", "Rozhodně ne"]', 6, true),
('Máš nějaké připomínky nebo návrhy pro redakci?', 'text', null, 7, false);