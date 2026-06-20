import { z } from "zod";

export const themeConfigSchema = z.object({
  mode: z.enum(["light", "dark", "system"]).default("light"),
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#F49A6C"),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#89906E"),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#F8F8F4"),
  foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#182033"),
  card: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#FFFFFF"),
  muted: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#EFF0EA"),
  border: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#E1E2DA"),
  radius: z.enum(["sm", "md", "lg"]).default("lg"),
  font: z.enum(["manrope", "inter", "system"]).default("manrope"),
  density: z.enum(["compact", "comfortable", "spacious"]).default("comfortable"),
  cardStyle: z.enum(["flat", "soft", "elevated"]).default("soft"),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export function getThemeConfig(config?: Partial<ThemeConfig>): ThemeConfig {
  return themeConfigSchema.parse(config ?? {});
}

export function validateThemeConfig(config: unknown) {
  return themeConfigSchema.safeParse(config);
}

export function applyThemeVariables(config: ThemeConfig) {
  const radii = { sm: "0.5rem", md: "0.75rem", lg: "1.25rem" };
  const density = {
    compact: { section: "2rem", sectionSm: "1.5rem" },
    comfortable: { section: "3rem", sectionSm: "2rem" },
    spacious: { section: "4.5rem", sectionSm: "3rem" },
  };
  return {
    "--color-primary": config.primary,
    "--color-accent": config.accent,
    "--color-background": config.background,
    "--color-foreground": config.foreground,
    "--color-card": config.card,
    "--color-card-foreground": config.foreground,
    "--color-muted": config.muted,
    "--color-secondary": config.muted,
    "--color-border": config.border,
    "--color-input": config.border,
    "--radius-lg": radii[config.radius],
    "--section-y": density[config.density].section,
    "--section-y-sm": density[config.density].sectionSm,
  } as React.CSSProperties;
}

export function generateAccessibleColorPair(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return { background: hex, foreground: luminance > 0.58 ? "#182033" : "#FFFFFF" };
}
