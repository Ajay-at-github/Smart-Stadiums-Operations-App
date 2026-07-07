from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.models.chat import (
    ChatRequest,
    ChatResponse,
)

from app.services.gemini_service import (
    generate_response,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "PromptWars API Running"}


@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    reply = generate_response(
        request.message
    )

    return ChatResponse(
        response=reply
    )