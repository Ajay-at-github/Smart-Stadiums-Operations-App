// eslint-disable-next-line no-unused-vars
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Profile from "../pages/Profile";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

describe("Profile Page Component", () => {
    it("should render visitor profile details", () => {
        useAuth.mockReturnValue({
            user: {
                uid: "USR-777",
                email: "visitor@fifaworldcup.com",
                displayName: "Alex Morgan",
                photoURL: "http://example.com/alex.jpg",
                metadata: {
                    creationTime: "2026-07-01T12:00:00Z",
                },
            },
        });

        render(
            <MemoryRouter>
                <Profile />
            </MemoryRouter>
        );

        // Verify title & name
        expect(screen.getByRole("heading", { name: "My Profile" })).toBeInTheDocument();
        expect(screen.getByRole("heading", { name: "Alex Morgan" })).toBeInTheDocument();
        expect(screen.getByText("Visitor ID: USR-777")).toBeInTheDocument();

        // Verify account details labels and values
        const detailsContainer = screen.getByLabelText("User Account Details");
        expect(detailsContainer).toBeInTheDocument();
        expect(screen.getByText("visitor@fifaworldcup.com")).toBeInTheDocument();
        expect(screen.getByText(/2026/)).toBeInTheDocument();
    });
});
