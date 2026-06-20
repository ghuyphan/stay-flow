import { describe, expect, it } from "vitest";
import {
  configToLegacyLayouts,
  defaultSiteBuilderConfig,
  normalizeSiteBuilderConfig,
  normalizeSiteBuilderState,
  type SiteBuilderConfig,
} from "./site-builder";
import type { StoredLayoutSettings } from "@/server/repositories/app-repository";

const legacyLayouts: StoredLayoutSettings = {
  home: [
    { id: "rooms", name: "Rooms", enabled: false },
    { id: "hero", name: "Hero", enabled: true },
  ],
  homestays: [
    { id: "resultGrid", name: "Grid", enabled: true },
    { id: "missing", name: "Missing", enabled: true },
  ],
  detail: [
    { id: "detailBooking", name: "Booking", enabled: false },
  ],
};

describe("site builder config normalization", () => {
  it("migrates legacy layout arrays into section instances", () => {
    const state = normalizeSiteBuilderState(undefined, defaultSiteBuilderConfig().theme, legacyLayouts);

    expect(state.live.pages.home.sections[0]).toMatchObject({
      type: "featuredStays",
      enabled: false,
    });
    expect(state.live.pages.home.sections[1]).toMatchObject({
      type: "hero",
      enabled: true,
    });
    expect(state.live.pages.homestays.sections.some((section) => section.id === "missing")).toBe(false);
    expect(state.live.pages.detail.sections[0]).toMatchObject({
      type: "detailBooking",
      enabled: false,
    });
  });

  it("adds missing default props and default sections", () => {
    const fallback = defaultSiteBuilderConfig();
    const normalized = normalizeSiteBuilderConfig({
      ...fallback,
      pages: {
        ...fallback.pages,
        home: {
          ...fallback.pages.home,
          sections: [{ id: "custom-hero", type: "hero", name: "Hero", enabled: true, props: {}, style: {} }],
        },
      },
    });

    expect(normalized.pages.home.sections[0].props.title?.en).toBe("Stay for a few hours or the night");
    expect(normalized.pages.home.sections.some((section) => section.type === "faq")).toBe(true);
  });

  it("drops unknown section types during normalization", () => {
    const fallback = defaultSiteBuilderConfig();
    const input = {
      ...fallback,
      pages: {
        ...fallback.pages,
        home: {
          ...fallback.pages.home,
          sections: [
            ...(fallback.pages.home.sections as SiteBuilderConfig["pages"]["home"]["sections"]),
            { id: "bad", type: "notReal", name: "Bad", enabled: true, props: {}, style: {} },
          ],
        },
      },
    } as unknown as SiteBuilderConfig;

    const normalized = normalizeSiteBuilderConfig(input, fallback);

    expect(normalized.pages.home.sections.some((section) => section.id === "bad")).toBe(false);
  });

  it("rejects invalid section props", () => {
    const fallback = defaultSiteBuilderConfig();
    const input = {
      ...fallback,
      pages: {
        ...fallback.pages,
        home: {
          ...fallback.pages.home,
          sections: [
            { id: "bad-props", type: "hero", name: "Hero", enabled: true, props: "nope", style: {} },
          ],
        },
      },
    } as unknown as SiteBuilderConfig;

    expect(() => normalizeSiteBuilderConfig(input, fallback)).toThrow("Invalid section props");
  });

  it("converts live builder config back to legacy layout endpoints", () => {
    const config = defaultSiteBuilderConfig();

    expect(configToLegacyLayouts(config).home[2]).toMatchObject({
      id: "rooms",
      enabled: true,
    });
  });
});
