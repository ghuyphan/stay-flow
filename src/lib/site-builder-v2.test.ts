import { describe, expect, it } from "vitest";
import { defaultSiteBuilderConfig } from "./site-builder";
import {
  createBuilderBlock,
  defaultBuilderV2Config,
  migrateV1ToV2,
  normalizeBuilderV2Config,
  validateBuilderV2ForPublish,
} from "./site-builder-v2";

describe("site builder v2", () => {
  it("migrates v1 home/listing/detail sections into v2 block pages", () => {
    const v1 = defaultSiteBuilderConfig();
    const v2 = migrateV1ToV2(v1);

    expect(v2.version).toBe(2);
    expect(v2.site.header.siteName).toBe(v1.header.siteName);
    expect(v2.pages.home.blocks.some((block) => block.type === "SearchWidget")).toBe(true);
    expect(v2.pages.homestays.blocks.some((block) => block.type === "HomestayGrid")).toBe(true);
    expect(v2.pages.detail.blocks.some((block) => block.type === "BookingPanel")).toBe(true);
  });

  it("normalizes v1 documents directly", () => {
    const normalized = normalizeBuilderV2Config(defaultSiteBuilderConfig());

    expect(normalized.version).toBe(2);
    expect(normalized.pages.support.blocks.length).toBeGreaterThan(0);
  });

  it("repairs missing required protected widgets during normalization", () => {
    const fallback = defaultBuilderV2Config();
    const broken = structuredClone(fallback);
    broken.pages.bookingPayment.blocks = [createBuilderBlock("Text")];

    const normalized = normalizeBuilderV2Config(broken, fallback);

    expect(normalized.pages.bookingPayment.blocks.some((block) => block.type === "PaymentPanel")).toBe(true);
  });

  it("reports invalid publish configs when required widgets are absent", () => {
    const config = defaultBuilderV2Config();
    config.pages.detail.blocks = config.pages.detail.blocks.filter((block) => block.type !== "BookingPanel");

    expect(validateBuilderV2ForPublish(config)).toContain("Stay Detail needs a Booking Panel block.");
  });

  it("keeps protected widgets locked when created from the block factory", () => {
    const block = createBuilderBlock("BookingPanel", { locked: true, props: { title: { en: "Unsafe", vi: "Unsafe" } } });

    expect(block.locked).toBe(true);
    expect(block.type).toBe("BookingPanel");
  });
});
