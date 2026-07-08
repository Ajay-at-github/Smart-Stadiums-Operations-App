// eslint-disable-next-line no-unused-vars
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

// Mock the AuthContext
vi.mock("../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

describe("Navbar Component Accessibility", () => {
    it("should render brand title and standard navigation links", () => {
        useAuth.mockReturnValue({ user: null });
        
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        // Verify skip-to-content link is present and routes to main-content
        const skipLink = screen.getByText("Skip to main content");
        expect(skipLink).toBeInTheDocument();
        expect(skipLink).toHaveAttribute("href", "#main-content");

        // Verify brand name
        expect(screen.getByText("PromptWars")).toBeInTheDocument();
        expect(screen.getByText("Dashboard")).toBeInTheDocument();
        expect(screen.getByText("Chat")).toBeInTheDocument();
    });

    it("should render user avatar, name, and logout button when user is logged in", () => {
        useAuth.mockReturnValue({
            user: {
                email: "visitor@worldcup.com",
                displayName: "Tournament Fan",
                photoURL: "http://example.com/avatar.jpg",
            },
        });
        
        render(
            <MemoryRouter>
                <Navbar />
            </MemoryRouter>
        );

        // Verify display name and avatar alternate description are present
        expect(screen.getByText("Tournament Fan")).toBeInTheDocument();
        expect(screen.getByAltText("Tournament Fan's avatar")).toBeInTheDocument();
        
        // Verify logout button is present with correct accessibility labels
        const logoutBtn = screen.getByRole("button", { name: "Log out of account" });
        expect(logoutBtn).toBeInTheDocument();
    });
});
