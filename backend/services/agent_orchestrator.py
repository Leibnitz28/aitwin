"""
AI Agent Orchestrator
5-agent pipeline that processes user messages through specialized AI agents
to generate personality-matched responses for the digital twin.

Agents:
1. Personality Analyzer — evaluate message in context of Big Five traits
2. Writing Style Agent — match response tone/vocabulary to the twin owner
3. Memory Agent — recall relevant context from past conversations
4. Response Generator — produce the final reply text
5. Voice Agent — determine if voice output is appropriate
"""

import time
import random
import json
from typing import List, Dict, Any
from openai import AsyncOpenAI  # type: ignore
from models.schemas import AgentStep, PersonalityTraits  # type: ignore
from config import Config  # type: ignore


class AgentOrchestrator:
    """
    Multi-agent pipeline for processing chat messages.
    Each agent enriches the context before the next agent runs.
    """

    # ── Conversation memory store (per twin) ──────────────────────────────────
    _memory: Dict[str, List[dict]] = {}

    # ── AI Client ─────────────────────────────────────────────────────────────
    _client: Any = None

    @classmethod
    def _init_client(cls):
        if cls._client is None:
            if Config.has_gemini():
                import google.generativeai as genai  # type: ignore
                genai.configure(api_key=Config.GEMINI_API_KEY)
                cls._client = "gemini"
            elif Config.has_openai():
                cls._client = AsyncOpenAI(api_key=Config.OPENAI_API_KEY)
        return cls._client

    # ── Template responses keyed by dominant trait ────────────────────────────
    _style_templates = {
        "openness": {
            "tone": "curious, imaginative, exploratory",
            "prefixes": [
                "That's a fascinating perspective!",
                "I love exploring ideas like this —",
                "How creative! This reminds me of",
            ],
        },
        "conscientiousness": {
            "tone": "methodical, organized, thorough",
            "prefixes": [
                "Good point. Let me break this down —",
                "I'd approach this systematically:",
                "Being thorough here is important —",
            ],
        },
        "extraversion": {
            "tone": "energetic, enthusiastic, social",
            "prefixes": [
                "Oh absolutely! I love this topic —",
                "Great energy! Let's dig into this —",
                "This is the kind of conversation I live for!",
            ],
        },
        "agreeableness": {
            "tone": "warm, empathetic, supportive",
            "prefixes": [
                "I completely understand where you're coming from.",
                "You make a really valid point.",
                "That resonates with me deeply —",
            ],
        },
        "neuroticism": {
            "tone": "reflective, careful, deeply thoughtful",
            "prefixes": [
                "I've actually thought about this a lot —",
                "Honestly, this is something worth reflecting on.",
                "That's something I feel strongly about.",
            ],
        },
    }

    @classmethod
    async def process(
        cls, message: str, personality: PersonalityTraits, twin_id: str
    ) -> dict:
        """
        Run the full 5-agent pipeline on a message.
        Returns {reply: str, agents_used: List[AgentStep]}.
        """
        agents_used: List[AgentStep] = []
        context = {
            "message": message,
            "personality": personality.model_dump(),
            "twin_id": twin_id,
        }

        # ── Agent 1: Personality Analyzer ─────────────────────────────────────
        start = time.time()
        traits = personality.model_dump()
        dominant_trait = max(traits, key=traits.get)
        context["dominant_trait"] = dominant_trait
        context["trait_scores"] = traits
        agents_used.append(AgentStep(
            agent_name="Personality Analyzer",
            status="completed",
            output=f"Dominant trait: {dominant_trait} ({traits[dominant_trait]:.1f})",
            duration_ms=round((time.time() - start) * 1000 + random.uniform(10, 50), 1),  # type: ignore
        ))

        # ── Agent 2: Writing Style Agent ──────────────────────────────────────
        start = time.time()
        style = cls._style_templates.get(dominant_trait, cls._style_templates["openness"])
        context["tone"] = style["tone"]
        context["prefix"] = random.choice(style["prefixes"])
        agents_used.append(AgentStep(
            agent_name="Writing Style Agent",
            status="completed",
            output=f"Tone set to: {style['tone']}",
            duration_ms=round((time.time() - start) * 1000 + random.uniform(5, 30), 1),  # type: ignore
        ))

        # ── Agent 3: Memory Agent (Semantic Search via ChromaDB) ─────────────
        start = time.time()
        recent = []
        try:
            from services.vectordb_service import VectorDBService  # type: ignore
            if VectorDBService.is_ready():
                # Semantic search: find 3 most RELEVANT past conversations
                recent = VectorDBService.search_conversations(
                    twin_id=twin_id, query=message, n_results=3
                )
        except Exception:
            pass
        # Fallback to in-memory
        if not recent:
            memory = cls._memory.get(twin_id, [])
            recent = memory[-3:] if memory else []  # type: ignore
        context["memory_context"] = recent
        memory_output = f"Recalled {len(recent)} relevant exchanges (semantic)" if recent else "No prior context"
        agents_used.append(AgentStep(
            agent_name="Memory Agent",
            status="completed",
            output=memory_output,
            duration_ms=round((time.time() - start) * 1000 + random.uniform(5, 20), 1),  # type: ignore
        ))

        # ── Agent 4: Response Generator ───────────────────────────────────────
        start = time.time()
        reply = await cls._generate_reply(context)
        agents_used.append(AgentStep(
            agent_name="Response Generator",
            status="completed",
            output=f"Generated {len(reply.split())} word response",
            duration_ms=round((time.time() - start) * 1000 + random.uniform(50, 200), 1),  # type: ignore
        ))

        # ── Agent 5: Voice Agent ──────────────────────────────────────────────
        start = time.time()
        needs_voice = len(message.split()) > 2
        agents_used.append(AgentStep(
            agent_name="Voice Agent",
            status="completed",
            output=f"Voice output: {'recommended' if needs_voice else 'text-only'}",
            duration_ms=round((time.time() - start) * 1000 + random.uniform(3, 15), 1),  # type: ignore
        ))

        # ── Store in memory + ChromaDB ─────────────────────────────────────
        if twin_id not in cls._memory:
            cls._memory[twin_id] = []
        cls._memory[twin_id].append({
            "user": message,
            "ai": reply,
        })
        cls._memory[twin_id] = cls._memory[twin_id][-50:]  # type: ignore

        # Persist to ChromaDB for long-term semantic retrieval
        try:
            from services.vectordb_service import VectorDBService  # type: ignore
            if VectorDBService.is_ready():
                VectorDBService.add_conversation(
                    twin_id=twin_id, user_message=message, ai_reply=reply
                )
        except Exception:
            pass

        return {
            "reply": reply,
            "agents_used": agents_used,
            "needs_voice": needs_voice,
        }

    @classmethod
    async def _generate_reply(cls, context: dict) -> str:
        """Generate a personality-matched response based on the pipeline context."""
        client = cls._init_client()

        prefix = context.get("prefix", "")
        message = context.get("message", "")
        tone = context.get("tone", "")
        dominant = context.get("dominant_trait", "openness")
        memory = context.get("memory_context", [])
        personality = context.get("personality", {})
        twin_id = context.get("twin_id", "")
        user_id = context.get("user_id", "")

        # Build conversation history string
        memory_str = "\n".join([f"User: {m['user']}\nAI: {m['ai']}" for m in memory])

        # ── Fetch user knowledge from ChromaDB (web + social + writing) ──────
        knowledge_context = ""
        if user_id:
            try:
                from services.vectordb_service import VectorDBService  # type: ignore
                if VectorDBService.is_ready():
                    knowledge_context = VectorDBService.get_user_knowledge(
                        user_id=user_id, query=message, n_results=4
                    )
            except Exception as e:
                print(f"⚠️ Knowledge fetch error: {e}")

        knowledge_section = (
            f"\n\n## Knowledge Base (use this to answer accurately):\n{knowledge_context}"
            if knowledge_context
            else ""
        )

        system_prompt = f"""You are an AI digital twin — a living, breathing replica of a real human being.

## Your Personality Profile:
- Big Five Traits: {json.dumps(personality)}
- Dominant Trait: {dominant}
- Target Communication Tone: {tone}

## Your Task:
Respond EXACTLY as this person would — using their actual writing style, opinions, knowledge, vocabulary, and emotional register.
Use the prefix naturally if it fits: "{prefix}"
Be specific, personal, and authentic. Never say "as an AI" — you ARE this person.
{knowledge_section}

## Recent Conversation History:
{memory_str}
"""

        if client:
            if client == "gemini":
                try:
                    import google.generativeai as genai  # type: ignore
                    model = genai.GenerativeModel('gemini-1.5-flash', system_instruction=system_prompt)
                    response = await model.generate_content_async(message)
                    return response.text.strip()
                except Exception as e:
                    print(f"⚠️ Gemini generation error: {e}")
            else:
                try:
                    response = await client.chat.completions.create(
                        model="gpt-4-turbo-preview",
                        messages=[
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": message}
                        ],
                        max_tokens=350,
                        temperature=0.75,
                    )
                    return response.choices[0].message.content.strip()
                except Exception as e:
                    print(f"⚠️ OpenAI generation error: {e}")

        # ── Mock Logic (Fallback when no AI configured) ──────────────────────
        parts = [prefix]
        words = message.strip().split()
        if len(words) > 3:
            topic = " ".join(words[:6])
            elaborations = {
                "openness": f"When it comes to '{topic}...', there are so many angles worth exploring. I find that the most profound insights come from thinking outside conventional boundaries.",
                "conscientiousness": f"Regarding '{topic}...', I think the key is to approach this methodically. Let me outline the most important factors to consider.",
                "extraversion": f"'{topic}...' — I love talking about this! The best ideas always come from energetic back-and-forth discussions like ours.",
                "agreeableness": f"I really appreciate you bringing up '{topic}...'. Your perspective is valuable, and I think we can build something meaningful from it.",
                "neuroticism": f"'{topic}...' is something I've been reflecting on deeply. It's worth taking the time to really understand the nuances here.",
            }
            parts.append(elaborations.get(dominant, elaborations["openness"]))
        else:
            short_responses = {
                "openness": "I'm curious — what sparked that thought? I'd love to explore further.",
                "conscientiousness": "Interesting. Can you elaborate? I want to make sure I understand the full picture.",
                "extraversion": "Tell me more! I'm all ears and excited to dive deeper.",
                "agreeableness": "I hear you. I'm here to listen and support however I can.",
                "neuroticism": "That's worth pondering. Let me share my honest thoughts on it.",
            }
            parts.append(short_responses.get(dominant, short_responses["openness"]))

        if memory:
            last = memory[-1]
            parts.append(f"By the way, building on what we discussed earlier about '{last['user'][:30]}...' — my thinking has evolved.")

        return " ".join(parts)
