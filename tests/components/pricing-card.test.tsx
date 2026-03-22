// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";
import { act } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PricingCard } from "@/components/billing/pricing-card";

const mockPlan = {
  name: "Pro",
  description: "Test description",
  price: "$29",
  period: "month",
  productId: "prod_test_123",
  features: ["Unlimited projects", "API access"],
  popular: false,
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

describe("PricingCard", () => {
  it("renders plan name and price", () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.getByText("Pro")).toBeTruthy();
    expect(screen.getByText("$29")).toBeTruthy();
  });

  it("renders all features", () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.getByText("Unlimited projects")).toBeTruthy();
    expect(screen.getByText("API access")).toBeTruthy();
  });

  it("shows Most Popular badge for popular plans", () => {
    render(<PricingCard plan={{ ...mockPlan, popular: true }} />);
    expect(screen.getByText("Most Popular")).toBeTruthy();
  });

  it("does not show badge for non-popular plans", () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.queryByText("Most Popular")).toBeNull();
  });

  it("shows Get Started button", () => {
    render(<PricingCard plan={mockPlan} />);
    expect(screen.getByRole("button", { name: /initiate payment/i })).toBeTruthy();
  });

  it("calls /api/checkout on click with correct productId", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ url: "https://checkout.creem.io/test" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<PricingCard plan={mockPlan} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /initiate payment/i }));
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: "prod_test_123" }),
    });
  });

  it("shows Processing Payment... loading state", async () => {
    let resolvePromise!: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pendingPromise));

    render(<PricingCard plan={mockPlan} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /initiate payment/i }));
    });

    expect(screen.getByText("Processing Payment...")).toBeTruthy();
    // cleanup: resolve so no hanging promises
    resolvePromise({ json: () => Promise.resolve({}) });
  });

  it("calls checkout endpoint when unauthorized is returned", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ error: "Unauthorized" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    render(<PricingCard plan={mockPlan} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /initiate payment/i }));
    });

    expect(mockFetch).toHaveBeenCalledWith("/api/checkout", expect.any(Object));
  });
});
