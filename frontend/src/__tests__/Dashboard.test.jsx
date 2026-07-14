// eslint-disable-next-line no-unused-vars
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

describe("Dashboard Page Component", () => {
    it("should render welcome text hero and quick actions grid", () => {
        useAuth.mockReturnValue({ user: { email: "test@user.com" } });
        render(
            <MemoryRouter>
                <Dashboard />
            </MemoryRouter>
        );

        expect(screen.getByText(/Welcome to PromptWars Stadium!/)).toBeInTheDocument();
        expect(screen.getByRole("region", { name: "Quick Actions" })).toBeInTheDocument();
        expect(screen.getByText("Chat Assistant")).toBeInTheDocument();
    });
});
