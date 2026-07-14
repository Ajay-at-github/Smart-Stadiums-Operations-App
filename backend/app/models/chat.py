"""Module containing Pydantic schemas for chat requests and responses."""

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Pydantic model representing a user chat query."""

    message: str = Field(..., min_length=1, max_length=1000)


class ChatResponse(BaseModel):
    """Pydantic model representing the assistant chat response."""

    response: str
