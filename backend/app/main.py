import os
import time
from collections import defaultdict
from typing import Any, Callable, Dict, List
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.models.chat import (
    ChatRequest,
    ChatResponse,
)

from app.services.gemini_service import (
    generate_response,
)

app = FastAPI(
    title="FIFA Smart Stadium Concierge API",
    description="Backend API for promptwars smart stadium operations concierge.",
    version="1.1.0",
)

# Secure CORS: read origins from environment variable ALLOWED_ORIGINS
allowed_origins_env = os.getenv("ALLOWED_ORIGINS")
if allowed_origins_env:
    allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",")]
else:
    allowed_origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://smart-stadiums-operations-app.onrender.com",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Sliding Window Rate Limiting Middleware
class RateLimitMiddleware(BaseHTTPMiddleware):
    """
    Sliding window in-memory rate limiting middleware to prevent DDoS
    attacks and Gemini API token exhaustion.
    """
    def __init__(self, app: FastAPI, limit: int = 60, window: int = 60) -> None:
        """
        Initialize the rate limiting middleware.
        
        Args:
            app: The FastAPI application.
            limit: Maximum requests allowed.
            window: Time window in seconds.
        """
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.requests: Dict[str, List[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next: Callable[[Request], Any]) -> Response:
        """
        Interprets and rate-limits requests targeting the chat route.
        """
        if request.url.path == "/chat":
            client_ip = request.client.host if request.client else "unknown"
            current_time = time.time()
            
            # Clean old requests
            self.requests[client_ip] = [
                t for t in self.requests[client_ip]
                if current_time - t < self.window
            ]
            
            if len(self.requests[client_ip]) >= self.limit:
                return JSONResponse(
                    status_code=429,
                    content={"detail": "Too many requests. Please try again later."}
                )
            
            self.requests[client_ip].append(current_time)

        response = await call_next(request)
        return response


app.add_middleware(RateLimitMiddleware, limit=60, window=60)


# Security Headers Middleware
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Middleware injecting core HTTP security response headers to secure
    clients from vulnerabilities (e.g., Clickjacking, XSS, MIME Sniffing).
    """
    async def dispatch(self, request: Request, call_next: Callable[[Request], Any]) -> Response:
        """Inject security headers into all outgoing HTTP responses."""
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response


app.add_middleware(SecurityHeadersMiddleware)


@app.get("/")
async def root() -> Dict[str, str]:
    """
    Verify server health and connection status.
    
    Returns:
        A dictionary with a running verification message.
    """
    return {"message": "PromptWars API Running"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process incoming queries through the RAG context matching and 
    Gemini text generation pipelines.
    
    Args:
        request: Validated ChatRequest model payload.
        
    Returns:
        ChatResponse model with the assistant answer.
    """
    reply = await generate_response(
        request.message
    )

    return ChatResponse(
        response=reply
    )
