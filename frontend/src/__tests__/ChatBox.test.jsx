// eslint-disable-next-line no-unused-vars
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatBox from "../components/ChatBox";
import api from "../services/api";

// Mock API service module
vi.mock("../services/api", () => ({
    default: {
        post: vi.fn(),
    },
}));

describe("ChatBox Component", () => {
    it("should render initial welcome message and quick suggestion buttons", () => {
        render(<ChatBox />);

        expect(screen.getByText(/Welcome to the stadium assistant/)).toBeInTheDocument();
        expect(screen.getByRole("group", { name: "Chat query suggestions" })).toBeInTheDocument();
    });

    it("should allow entering query text and updating context on send", async () => {
        api.post.mockResolvedValueOnce({
            data: { response: "Gate A is located in the North zone." },
        });

        render(<ChatBox />);

        const input = screen.getByLabelText("Message text input");
        const sendBtn = screen.getByRole("button", { name: "Send message" });

        fireEvent.change(input, { target: { value: "Where is Gate A?" } });
        fireEvent.click(sendBtn);

        // Verify local prompt update
        expect(screen.getByText("Where is Gate A?")).toBeInTheDocument();

        // Verify API was called
        await waitFor(() => {
            expect(api.post).toHaveBeenCalledWith("/chat", { message: "Where is Gate A?" });
        });

        // Verify generated response is rendered
        await waitFor(() => {
            expect(screen.getByText("Gate A is located in the North zone.")).toBeInTheDocument();
        });
    });
});
