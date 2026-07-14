from unittest.mock import AsyncMock, patch


def test_root_endpoint(client):
    """Test that the root route is accessible and returns API status."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "PromptWars API Running"}


@patch("app.main.generate_response", new_callable=AsyncMock)
def test_chat_success(mock_gen_response, client):
    """Test successful chat interaction."""
    mock_gen_response.return_value = "This is a mock stadium assistant reply."
    payload = {"message": "Where is the nearest charging station?"}
    response = client.post("/chat", json=payload)

    assert response.status_code == 200
    assert response.json() == {"response": "This is a mock stadium assistant reply."}
    mock_gen_response.assert_called_once_with("Where is the nearest charging station?")


def test_chat_validation_too_short(client):
    """Test validation fails for empty string input."""
    payload = {"message": ""}
    response = client.post("/chat", json=payload)
    assert response.status_code == 422


def test_chat_validation_too_long(client):
    """Test validation fails for input exceeding length constraints."""
    payload = {"message": "a" * 1001}
    response = client.post("/chat", json=payload)
    assert response.status_code == 422


def test_security_headers(client):
    """Verify standard security headers are injected in all responses."""
    response = client.get("/")
    assert response.headers.get("X-Content-Type-Options") == "nosniff"
    assert response.headers.get("X-Frame-Options") == "DENY"
    assert response.headers.get("X-XSS-Protection") == "1; mode=block"
    assert response.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"


@patch("app.main.generate_response", new_callable=AsyncMock)
def test_rate_limiting(mock_gen_response, client):
    """Test that the custom rate limiting middleware works as expected."""
    # Reset RateLimitMiddleware requests tracker state
    current_app = client.app.middleware_stack
    while hasattr(current_app, "app"):
        if current_app.__class__.__name__ == "RateLimitMiddleware":
            current_app.requests.clear()
        current_app = current_app.app

    mock_gen_response.return_value = "Test response"
    payload = {"message": "Quick check"}

    # Send 60 requests which is the limit (should pass)
    for _ in range(60):
        response = client.post("/chat", json=payload)
        assert response.status_code == 200

    # 61st request should be rate-limited
    response = client.post("/chat", json=payload)
    assert response.status_code == 429
    assert response.json() == {"detail": "Too many requests. Please try again later."}

