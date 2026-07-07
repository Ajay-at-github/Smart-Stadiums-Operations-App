import os

import google.generativeai as genai

from dotenv import load_dotenv

from app.prompts.system_prompt import SYSTEM_PROMPT
from app.services.rag_service import rag_service

load_dotenv()

genai.configure(
    api_key=os.getenv("GEMINI_API_KEY")
)

model = genai.GenerativeModel("gemini-2.5-flash")


def build_prompt(user_query: str, context: str) -> str:
    return f"""
{SYSTEM_PROMPT}

==================================================
RETRIEVED STADIUM KNOWLEDGE
==================================================

{context}

==================================================
USER QUESTION
==================================================

{user_query}

==================================================
ANSWER
==================================================
"""


def generate_response(message: str) -> str:

    rag_result = rag_service.retrieve_context(message)

    context = rag_result["context"]

    prompt = build_prompt(
        user_query=message,
        context=context
    )

    response = model.generate_content(prompt)

    return response.text