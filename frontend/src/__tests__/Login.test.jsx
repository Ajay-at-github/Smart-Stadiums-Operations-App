// eslint-disable-next-line no-unused-vars
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Login from "../pages/Login";
import { useAuth } from "../context/AuthContext";

vi.mock("../context/AuthContext", () => ({
    useAuth: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
    signInWithPopup: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    GoogleAuthProvider: vi.fn(),
    getAuth: vi.fn(),
}));

vi.mock("../services/firebase", () => ({
    auth: {},
    googleProvider: {},
}));

describe("Login Page Component", () => {
    it("should render login form inputs and social auth button", () => {
        useAuth.mockReturnValue({ user: null });
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
        expect(screen.getByLabelText("Password")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Continue with Google Authentication" })).toBeInTheDocument();
    });

    it("should toggle to creation mode when register link clicked", () => {
        useAuth.mockReturnValue({ user: null });
        render(
            <MemoryRouter>
                <Login />
            </MemoryRouter>
        );

        const toggleBtn = screen.getByRole("button", { name: "Create one" });
        fireEvent.click(toggleBtn);

        expect(screen.getByRole("button", { name: "Create Account" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    });
});
