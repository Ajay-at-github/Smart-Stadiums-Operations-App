// eslint-disable-next-line no-unused-vars
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "../components/Sidebar";

describe("Sidebar Component Accessibility", () => {
    it("should render active menu items and emergency guidelines alert", () => {
        render(
            <MemoryRouter initialEntries={["/dashboard"]}>
                <Sidebar />
            </MemoryRouter>
        );

        // Verify active page current attributes
        const dashboardLink = screen.getByRole("link", { name: "Dashboard" });
        expect(dashboardLink).toBeInTheDocument();
        expect(dashboardLink).toHaveAttribute("aria-current", "page");

        // Verify alternative page is not marked current
        const chatLink = screen.getByRole("link", { name: "Chat Bot" });
        expect(chatLink).toBeInTheDocument();
        expect(chatLink).not.toHaveAttribute("aria-current");

        // Verify emergency info panel note container and prompt message
        const noteContainer = screen.getByRole("note", { name: "Emergency Contact Information" });
        expect(noteContainer).toBeInTheDocument();
        expect(screen.getByText("Emergency Info")).toBeInTheDocument();
    });
});
