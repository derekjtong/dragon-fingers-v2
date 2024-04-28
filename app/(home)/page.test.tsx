import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import HomePage from "./page";

test("Home Page Loads", () => {
  render(<HomePage />);
  const enterRaceLink = screen.getByRole("link", { name: "Enter Race" });
  expect(enterRaceLink).toBeDefined();
  expect(enterRaceLink.getAttribute("href")).toBe("/game/temp-game");

  const joinCustomLink = screen.getByRole("link", { name: "Join Custom" });
  expect(joinCustomLink).toBeDefined();
  expect(joinCustomLink.getAttribute("href")).toBe("/game/join");

  const createCustomLink = screen.getByRole("link", { name: "Create Custom" });
  expect(createCustomLink).toBeDefined();
  expect(createCustomLink.getAttribute("href")).toBe("/game/create");
});
