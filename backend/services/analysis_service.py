"""
Personality Analysis Service
Big Five personality trait scoring from writing samples.
Used by the Personality Analyzer agent and standalone /analyze endpoint.
"""

import random
from models.schemas import AnalysisResult, PersonalityTraits


class PersonalityAnalysisService:
    """Analyze text to extract Big Five personality traits."""

    @staticmethod
    async def analyze_writing(text: str) -> AnalysisResult:
        """
        Analyze writing text and return Big Five personality trait scores.
        Currently uses keyword heuristics — plug in OpenAI/HuggingFace here.
        """
        text_lower = text.lower()
        words = text_lower.split()
        total = max(len(words), 1)

        # Keyword sets per trait
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

        # Determine dominant trait
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
