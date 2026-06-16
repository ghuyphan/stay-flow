import { z } from "zod";

export const themeConfigSchema = z.object({
  mode: z.enum(["light", "dark", "system"]).default("light"),
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#1F6F5F"),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#D98D5F"),
  radius: z.enum(["sm", "md", "lg"]).default("lg"),
  font: z.enum(["manrope", "inter", "system"]).default("manrope"),
});

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export function getThemeConfig(config?: Partial<ThemeConfig>): ThemeConfig {
  const parsed = themeConfigSchema.parse(config ?? {});
  return parsed.mode === "system" ? { ...parsed, mode: "light" } : parsed;
}

export function validateThemeConfig(config: unknown) {
  return themeConfigSchema.safeParse(config);
}

export function applyThemeVariables(config: ThemeConfig) {
  const radii = { sm: "0.5rem", md: "0.75rem", lg: "1.25rem" };
  return {
    "--color-primary": config.primary,
    "--color-accent": config.accent,
    "--radius-lg": radii[config.radius],
  } as React.CSSProperties;
}

export function generateAccessibleColorPair(hex: string) {
  const value = Number.parseInt(hex.slice(1), 16);
  const red = (value >> 16) & 255;
  const green = (value >> 8) & 255;
  const blue = value & 255;
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return { background: hex, foreground: luminance > 0.58 ? "#18201D" : "#FFFFFF" };
}
