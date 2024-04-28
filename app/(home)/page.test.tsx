import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("Home Page Loads", () => {
  render(<HomePage />);
  expect(screen.getByRole("heading", { level: 1, name: "Home Page" })).toBeDefined();
});
