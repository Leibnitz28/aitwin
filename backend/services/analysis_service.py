"""
Personality Analysis Service
Big Five personality trait scoring from writing samples.
Primary: Gemini / OpenAI LLM-powered analysis.
Fallback: Keyword heuristics (when no AI key is configured).
"""

import json
import random
from models.schemas import AnalysisResult, PersonalityTraits
from config import Config

_ANALYSIS_PROMPT = """You are an expert psychologist specializing in Big Five (OCEAN) personality assessment.
Analyze the following text written by a person and score their Big Five personality traits.

Return ONLY valid JSON in exactly this format (no markdown, no explanation):
{{
  "openness": <0-100>,
  "conscientiousness": <0-100>,
  "extraversion": <0-100>,
  "agreeableness": <0-100>,
  "neuroticism": <0-100>,
  "summary": "<2-3 sentence personality summary>",
  "communication_style": "<1 sentence describing how this person communicates>"
}}

Text to analyze:
{text}"""


class PersonalityAnalysisService:
    """Analyze text to extract Big Five personality traits."""

    @staticmethod
    async def analyze_writing(text: str) -> AnalysisResult:
        """
        Analyze writing text and return Big Five personality trait scores.
        Uses Gemini or OpenAI for accurate analysis, falls back to heuristics.
        """
        # Try AI-powered analysis first
        if Config.has_gemini():
            try:
                result = await PersonalityAnalysisService._analyze_with_gemini(text)
                if result:
                    return result
            except Exception as e:
                print(f"⚠️ Gemini analysis error: {e}")

        if Config.has_openai():
            try:
                result = await PersonalityAnalysisService._analyze_with_openai(text)
                if result:
                    return result
            except Exception as e:
                print(f"⚠️ OpenAI analysis error: {e}")

        # Fallback to keyword heuristics
        return PersonalityAnalysisService._analyze_with_heuristics(text)

    @staticmethod
    async def _analyze_with_gemini(text: str) -> AnalysisResult | None:
        """Use Gemini to perform Big Five analysis."""
        import google.generativeai as genai  # type: ignore
        genai.configure(api_key=Config.GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = _ANALYSIS_PROMPT.format(text=text[:4000])  # Limit tokens
        response = await model.generate_content_async(prompt)
        raw = response.text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        return PersonalityAnalysisService._build_result(data)

    @staticmethod
    async def _analyze_with_openai(text: str) -> AnalysisResult | None:
        """Use OpenAI to perform Big Five analysis."""
        from openai import AsyncOpenAI  # type: ignore
        client = AsyncOpenAI(api_key=Config.OPENAI_API_KEY)
        prompt = _ANALYSIS_PROMPT.format(text=text[:4000])
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=400,
            temperature=0.3,
        )
        raw = response.choices[0].message.content.strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        data = json.loads(raw)
        return PersonalityAnalysisService._build_result(data)

    @staticmethod
    def _build_result(data: dict) -> AnalysisResult:
        """Build AnalysisResult from parsed LLM JSON."""
        traits = PersonalityTraits(
            openness=float(data.get("openness", 60)),
            conscientiousness=float(data.get("conscientiousness", 60)),
            extraversion=float(data.get("extraversion", 60)),
            agreeableness=float(data.get("agreeableness", 60)),
            neuroticism=float(data.get("neuroticism", 60)),
        )
        trait_dict = traits.model_dump()
        overall = round(sum(trait_dict.values()) / 5, 1)  # type: ignore
        return AnalysisResult(
            traits=traits,
            overall_match=min(overall, 99.5),
            summary=data.get("summary", "Personality analyzed successfully."),
            communication_style=data.get("communication_style", ""),
        )

    @staticmethod
    def _analyze_with_heuristics(text: str) -> AnalysisResult:
        """Fallback: keyword-based Big Five scoring."""
        text_lower = text.lower()
        words = text_lower.split()
        total = max(len(words), 1)

        openness_words = {
            "imagine", "wonder", "explore", "creative", "idea", "curious",
            "dream", "novel", "unique", "artistic", "learn", "believe", "think",
            "discover", "envision", "abstract", "inspire", "innovate",
        }
        consc_words = {
            "plan", "organize", "schedule", "goal", "achieve", "responsible",
            "detail", "careful", "systematic", "efficient", "complete", "commit",
            "discipline", "focus", "structure", "reliable", "thorough",
        }
        extra_words = {
            "social", "party", "talk", "friend", "love", "people",
            "fun", "enjoy", "meet", "share", "laugh", "happy", "excited",
            "energetic", "outgoing", "adventure", "group", "celebrate",
        }
        agree_words = {
            "help", "support", "care", "kind", "trust", "together",
            "understand", "appreciate", "respect", "value", "team",
            "cooperate", "empathy", "generous", "compassion", "harmony",
        }
        neuro_words = {
            "worry", "stress", "anxious", "fear", "nervous", "upset",
            "concern", "difficult", "struggle", "doubt", "frustrated",
            "overwhelm", "insecure", "tense", "vulnerable", "uncertain",
        }

        def score(keyword_set):
            hits = sum(1 for w in words if w in keyword_set)
            base = min(round((hits / total) * 500, 1), 70)  # type: ignore
            return round(min(base + random.uniform(20, 35), 100), 1)  # type: ignore

        traits = PersonalityTraits(
            openness=score(openness_words),
            conscientiousness=score(consc_words),
            extraversion=score(extra_words),
            agreeableness=score(agree_words),
            neuroticism=score(neuro_words),
        )
        trait_dict = traits.model_dump()
        dominant = max(trait_dict, key=trait_dict.get)
        overall = round(sum(trait_dict.values()) / 5, 1)  # type: ignore
        summaries = {
            "openness": "Highly creative and intellectually curious. You thrive on new ideas and embrace change.",
            "conscientiousness": "Organized and goal-oriented. You bring reliability and careful thought to everything you do.",
            "extraversion": "Energetic and socially driven. You draw energy from connecting with others.",
            "agreeableness": "Warm, empathetic, and cooperative. You build strong, trusting relationships naturally.",
            "neuroticism": "Emotionally perceptive and deeply reflective. You feel things deeply and think carefully.",
        }
        return AnalysisResult(
            traits=traits,
            overall_match=overall,
            summary=summaries[dominant],
        )
