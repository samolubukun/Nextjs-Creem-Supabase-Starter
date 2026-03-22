import { describe, expect, it } from "vitest";
import { formatTransaction } from "@/app/api/transactions/helpers";

describe("formatTransaction", () => {
  it("formats USD amount correctly", () => {
    const result = formatTransaction({
      id: "tx_1",
      amount: 2900,
      type: "subscription_topup",
      status: "completed",
      created_at: "2026-03-01T00:00:00Z",
    });
    expect(result.displayAmount).toBe("$29.00");
  });

  it("formats cent amounts using configured app currency", () => {
    const result = formatTransaction({
      id: "tx_2",
      amount: 990,
      type: "subscription_topup",
      status: "completed",
      created_at: "2026-03-01T00:00:00Z",
    });
    expect(result.displayAmount).toBe("$9.90");
  });

  it("defaults unknown currency to USD", () => {
    const result = formatTransaction({
      id: "tx_3",
      amount: 100,
      type: "subscription_topup",
      status: "completed",
      created_at: "2026-03-01T00:00:00Z",
    });
    expect(result.displayAmount).toBe("$1.00");
  });

  it("handles zero amount", () => {
    const result = formatTransaction({
      id: "tx_4",
      amount: 0,
      type: "subscription_topup",
      status: "pending",
      created_at: "2026-03-01T00:00:00Z",
    });
    expect(result.displayAmount).toBe("$0.00");
  });
});
