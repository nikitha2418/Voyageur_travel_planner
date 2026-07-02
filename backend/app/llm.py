"""Groq LLM client and the destination -> itinerary -> budget prompt chain."""
import json
import re
from typing import Any

from groq import Groq

from .config import settings
from . import prompts


class LLMError(RuntimeError):
    """Raised when the LLM is misconfigured or returns unusable output."""


def _client() -> Groq:
    if not settings.groq_api_key:
        raise LLMError(
            "GROQ_API_KEY is not set. Add it to backend/.env or the environment."
        )
    return Groq(api_key=settings.groq_api_key)


def _extract_json(text: str) -> Any:
    """Parse a JSON object from a model response, tolerating stray fences/prose."""
    text = text.strip()
    # Strip ```json ... ``` fences if the model added them anyway.
    fenced = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.DOTALL)
    if fenced:
        text = fenced.group(1)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        # Fallback: grab the outermost {...} block.
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(text[start:end + 1])
        raise LLMError("Model did not return valid JSON.")


def _chat_json(system: str, user: str, temperature: float = 0.6) -> Any:
    """Single LLM turn that must return a JSON object."""
    client = _client()
    resp = client.chat.completions.create(
        model=settings.groq_model,
        temperature=temperature,
        response_format={"type": "json_object"},  # Groq JSON mode
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
    )
    content = resp.choices[0].message.content or ""
    return _extract_json(content)


# ---------------------------------------------------------------------------
# The three chained steps
# ---------------------------------------------------------------------------
def research_destination(destination: str, interests: list[str], num_days: int) -> dict:
    user = prompts.RESEARCH_USER.format(
        destination=destination,
        interests=", ".join(interests) or "general sightseeing",
        num_days=num_days,
    )
    return _chat_json(prompts.RESEARCH_SYSTEM, user, temperature=0.7)


def build_itinerary(
    destination: str,
    interests: list[str],
    num_days: int,
    budget: float,
    currency: str,
    research: dict,
) -> dict:
    user = prompts.ITINERARY_USER.format(
        destination=destination,
        interests=", ".join(interests) or "general sightseeing",
        num_days=num_days,
        budget=budget,
        currency=currency,
        research_json=json.dumps(research, ensure_ascii=False),
    )
    return _chat_json(prompts.ITINERARY_SYSTEM, user, temperature=0.6)


def check_budget(
    destination: str,
    num_days: int,
    budget: float,
    currency: str,
    itinerary: dict,
) -> dict:
    user = prompts.BUDGET_USER.format(
        destination=destination,
        num_days=num_days,
        budget=budget,
        currency=currency,
        itinerary_json=json.dumps(itinerary, ensure_ascii=False),
    )
    return _chat_json(prompts.BUDGET_SYSTEM, user, temperature=0.3)


def generate_trip(
    destination: str,
    interests: list[str],
    num_days: int,
    budget: float,
    currency: str,
) -> dict:
    """Run the full 3-step prompt chain and return all intermediate outputs."""
    research = research_destination(destination, interests, num_days)
    itinerary = build_itinerary(
        destination, interests, num_days, budget, currency, research
    )
    budget_analysis = check_budget(destination, num_days, budget, currency, itinerary)
    return {
        "research": research,
        "itinerary": itinerary,
        "budget_analysis": budget_analysis,
    }


def make_title(destination: str, num_days: int, interests: list[str]) -> str:
    """Deterministic default title (no LLM call needed)."""
    focus = interests[0].title() if interests else "Explorer"
    return f"{num_days}-Day {destination} {focus} Trip"
