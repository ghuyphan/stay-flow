"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Compass, Globe } from "lucide-react";
import { usePathname } from "next/navigation";
import type { StoredTheme } from "@/server/repositories/app-repository";

export type Language = "en" | "vi";
export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  resolvedTheme: ResolvedTheme;
  siteTheme: StoredTheme;
  setSiteTheme: (theme: StoredTheme, options?: { persistMode?: boolean }) => void;
};

const DEFAULT_THEME: StoredTheme = {
  primary: "#ff8b5f",
  accent: "#ff8b5f",
  background: "#f8f8f4",
  foreground: "#182033",
  card: "#ffffff",
  muted: "#eff0ea",
  border: "#e1e2da",
  mode: "light",
  radius: "lg",
  font: "manrope",
  density: "comfortable",
  cardStyle: "soft",
};

function isLanguage(value: string | null): value is Language {
  return value === "en" || value === "vi";
}

function isThemeMode(value: string | null): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyPreferenceDom(language: Language, theme: StoredTheme, mode: ThemeMode, resolvedTheme: ResolvedTheme) {
  const radii = {
    sm: { sm: "0.375rem", md: "0.5rem", lg: "0.75rem" },
    md: { sm: "0.5rem", md: "0.75rem", lg: "1rem" },
    lg: { sm: "0.625rem", md: "1rem", lg: "1.5rem" },
  }[theme.radius ?? "lg"];
  const fonts = {
    manrope: {
      sans: '"Avenir Next", "Manrope", "Segoe UI", sans-serif',
      display: 'Georgia, "Times New Roman", serif',
    },
    inter: {
      sans: '"Inter", "Segoe UI", Arial, sans-serif',
      display: '"Inter", "Segoe UI", Arial, sans-serif',
    },
    system: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  }[theme.font ?? "manrope"];
  const density = {
    compact: { section: "2rem", sectionSm: "1.5rem" },
    comfortable: { section: "3rem", sectionSm: "2rem" },
    spacious: { section: "4.5rem", sectionSm: "3rem" },
  }[theme.density ?? "comfortable"];

  document.documentElement.lang = language;
  document.documentElement.dataset.themeMode = mode;
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.density = theme.density ?? "comfortable";
  document.documentElement.dataset.cardStyle = theme.cardStyle ?? "soft";
  document.documentElement.dataset.font = theme.font ?? "manrope";
  document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  document.documentElement.style.setProperty("--color-primary", theme.primary);
  document.documentElement.style.setProperty("--color-accent", theme.accent);
  document.documentElement.style.setProperty("--color-background", theme.background ?? DEFAULT_THEME.background);
  document.documentElement.style.setProperty("--color-foreground", theme.foreground ?? DEFAULT_THEME.foreground);
  document.documentElement.style.setProperty("--color-card", theme.card ?? DEFAULT_THEME.card);
  document.documentElement.style.setProperty("--color-card-foreground", theme.foreground ?? DEFAULT_THEME.foreground);
  document.documentElement.style.setProperty("--color-muted", theme.muted ?? DEFAULT_THEME.muted);
  document.documentElement.style.setProperty("--color-secondary", theme.muted ?? DEFAULT_THEME.muted);
  document.documentElement.style.setProperty("--color-border", theme.border ?? DEFAULT_THEME.border);
  document.documentElement.style.setProperty("--color-input", theme.border ?? DEFAULT_THEME.border);
  document.documentElement.style.setProperty("--color-ring", theme.primary);
  document.documentElement.style.setProperty("--radius-sm", radii.sm);
  document.documentElement.style.setProperty("--radius-md", radii.md);
  document.documentElement.style.setProperty("--radius-lg", radii.lg);
  document.documentElement.style.setProperty("--font-body", fonts.sans);
  document.documentElement.style.setProperty("--font-heading", fonts.display);
  document.documentElement.style.setProperty("--section-y", density.section);
  document.documentElement.style.setProperty("--section-y-sm", density.sectionSm);
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Footer
    "nav.stays": "Stays",
    "nav.for_hosts": "For hosts",
    "nav.support": "Support",
    "footer.copyright": "© 2026 StayFlow. All rights reserved.",

    // Homepage
    "hero.location": "District 1, Ho Chi Minh City",
    "hero.title": "Stay for a few hours or the night",
    "hero.subtitle": "Private rooms. Few hours or overnight.",
    "search.where": "Where",
    "search.where_placeholder": "District 1 or Thao Dien",
    "search.date": "Date",
    "search.guests": "Guests",
    "search.submit": "Find stays",
    "homestays.eyebrow": "Explore",
    "homestays.title": "Find your kind of stay",
    "homestays.desc": "Private rooms for quick city resets.",
    "homestays.stays_count": "{count} stays",
    "homestays.filters": "Filters",
    "homestays.no_results": "No stays match those filters.",
    "home.featured_title": "Featured stays",
    "home.featured_subtitle": "Ho Chi Minh City",
    "home.view_all": "View all",
    "home.trust_1_title": "Self check-in",
    "home.trust_1_desc": "Arrive and walk in.",
    "home.trust_2_title": "Food-friendly",
    "home.trust_2_desc": "Order to the room.",
    "home.trust_3_title": "Game-ready",
    "home.trust_3_desc": "Switch, PS4, or PS5.",
    "home.amenities_title": "Perks",
    "home.faq_title": "Before guests arrive",
    "home.faq_1_q": "Can guests book only a few hours?",
    "home.faq_1_a": "Yes. Hourly windows are priced separately from overnight and daily stays.",
    "home.faq_2_q": "When is availability checked?",
    "home.faq_2_a": "The server checks exact check-in and check-out times before creating a booking.",

    // Room Card / Detail
    "room.guests": "Up to {guests} guests",
    "room.beds": "{beds}",
    "room.size": "{size}",
    "room.left": "{count} left",
    "room.left_plural": "{count} left",
    "room.view_details": "Details",
    "room.select": "Select",
    "room.selected": "Selected",
    "room.back_to_homestay": "Back to {name}",
    "room.full_photo": "Full photo",
    "room.close_photo": "Close photo",
    "room.details_header": "Room details",
    "room.details_body": "Includes high-speed Wi-Fi, fresh towels, private bathroom access, soft lighting, and flexible self check-in. Final availability is confirmed when you submit your time.",
    "homestay.choose_room": "Choose your room",
    "homestay.rooms_avail": "Rooms available for your stay",
    "homestay.what_offers": "What this place offers",
    "homestay.short_stay_ready": "No-staff check-in",
    "homestay.short_stay_desc": "Private and low-key",
    "homestay.easy_arrival": "Food is welcome",
    "homestay.easy_arrival_desc": "Delivery-friendly stay",
    "homestay.book_secure": "Console-ready",
    "homestay.book_secure_desc": "Switch, PS4, PS5 options",

    // Booking Panel
    "booking.select_room": "Select room",
    "booking.guests_label": "Guests",
    "booking.date_label": "Date",
    "booking.checkin_label": "Start time",
    "booking.checkout_label": "Check-out",
    "booking.duration_label": "Duration",
    "booking.guest_count": "{count} guest",
    "booking.guest_count_plural": "{count} guests",
    "booking.max_guests": "{count} guests max",
    "booking.hourly": "Short",
    "booking.overnight": "Overnight",
    "booking.daily": "One day",
    "booking.estimated_total": "Estimated total",
    "booking.reserve": "Reserve",
    "booking.continue": "Continue · {price}",
    "booking.back": "Back",
    "booking.invalid_window": "Choose a valid time window.",
    "booking.hours_plural": "{count} hours",
    "booking.hours_singular": "{count} hour",
    "booking.days_plural": "{count} days",
    "booking.days_singular": "{count} day",
    "booking.nights_plural": "{count} nights",
    "booking.nights_singular": "{count} night",
    "booking.form_name": "Name",
    "booking.form_email": "Email",
    "booking.form_phone": "Phone",
    "booking.form_phone_sub": "(optional)",
    "booking.form_note": "Note",
    "booking.form_note_sub": "(optional)",
    "booking.form_note_placeholder": "Arrival time, plate number...",
    "booking.price_per_hour": "{price} / hour",
    "booking.rate_hourly": "{price} × {hours} hours",
    "booking.rate_hourly_block": "{price} for first {hours}h (extra {extra}/h)",
    "booking.rate_overnight": "{price} overnight ({time})",
    "booking.rate_daily": "{price} × {days} days",
    "booking.select_overnight_slot": "Select overnight slot",
    "ai.initial": "Hi. Ask me about a stay or paste a booking reference.",
    "ai.title": "StayFlow support",
    "ai.subtitle": "Rooms, policies, bookings",
    "ai.placeholder": "Type a question...",
    "ai.error": "I couldn't answer that. Try again shortly.",
    "admin.nav.overview": "Overview",
    "admin.nav.homestays": "Homestays",
    "admin.nav.bookings": "Bookings",
    "admin.nav.payments": "Payments",
    "admin.nav.site_builder": "Website Builder",
    "admin.nav.ai_knowledge": "AI knowledge",
    "admin.nav.settings": "Settings",
    "admin.property.label": "Active property",
    "admin.property.manage": "Manage properties",
    "admin.user.role": "Owner",
    "admin.today": "Thursday, June 18",
    "admin.sidebar.close": "Close sidebar",
    "admin.sidebar.open": "Open sidebar",
    "admin.sidebar.collapse": "Collapse sidebar",
    "admin.sidebar.expand": "Expand sidebar",
    "admin.sign_out": "Sign out",
    "admin.language_switch": "Chuyển sang tiếng Việt",
    "admin.overview.title": "Overview",
    "admin.overview.description": "Today across your stays",
    "admin.overview.manage_properties": "Manage properties",
    "admin.stats.revenue_month": "Revenue this month",
    "admin.stats.occupancy_rate": "Occupancy rate",
    "admin.stats.active_bookings": "Active bookings",
    "admin.stats.pending_payments": "Pending payments",
    "admin.stats.live": "Live",
    "admin.stats.needs_review": "Needs review",
    "admin.recent_bookings.title": "Recent bookings",
    "admin.recent_bookings.description": "Latest activity across all properties",
    "admin.view_all": "View all",
    "admin.table.guest": "Guest",
    "admin.table.property": "Property",
    "admin.table.total": "Total",
    "admin.table.status": "Status",
    "admin.table.actions": "Actions",
    "admin.table.actions_for": "Actions for {ref}",
    "admin.revenue_pulse.title": "Revenue pulse",
    "admin.revenue_pulse.description": "Last 7 days",
    "admin.revenue_pulse.chart": "Revenue bar chart",
    "admin.revenue_pulse.start": "Jun 9",
    "admin.revenue_pulse.end": "Jun 15",
    "admin.today_glance.title": "Today at a glance",
    "admin.today_glance.arrivals": "Arrivals",
    "admin.today_glance.departures": "Departures",
    "admin.today_glance.rooms_occupied": "Rooms occupied",
    "status.draft": "Draft",
    "status.pending_payment": "Pending payment",
    "status.paid": "Paid",
    "status.confirmed": "Confirmed",
    "status.checked_in": "Checked in",
    "status.checked_out": "Checked out",
    "status.cancelled": "Cancelled",
    "status.refunded": "Refunded",
    "status.failed": "Failed",

    // Language Popup
    "lang_popup.welcome": "Welcome to StayFlow! 🌟",
    "lang_popup.sub": "Please select your preferred language to customize your booking experience.",
    "lang_popup.select_vi": "Tiếng Việt (Vietnamese)",
    "lang_popup.select_en": "English (US/UK)",
  },
  vi: {
    // Nav & Footer
    "nav.stays": "Chỗ đi trốn",
    "nav.for_hosts": "Hợp tác chủ nhà",
    "nav.support": "Cứu trợ",
    "footer.copyright": "© 2026 StayFlow. Bản quyền thuộc về chúng mình nha.",

    // Homepage
    "hero.location": "Quận 1, Sài Gòn",
    "hero.title": "Trốn deadline vài tiếng hay ngủ qua đêm?",
    "hero.subtitle": "Phòng riêng tư, vài tiếng hay qua đêm.",
    "search.where": "Trốn ở đâu?",
    "search.where_placeholder": "Quận 1 hay Thảo Điền...",
    "search.date": "Ngày đi trốn",
    "search.guests": "Mấy slot?",
    "search.submit": "Kiếm chỗ chill",
    "homestays.eyebrow": "Lướt xem",
    "homestays.title": "Kiếm chỗ staycation hợp gu",
    "homestays.desc": "Phòng riêng tư cho mấy kèo chill nhanh.",
    "homestays.stays_count": "{count} homestay xịn xò",
    "homestays.filters": "Lọc gu",
    "homestays.no_results": "Hông tìm thấy homestay nào hợp gu bồ rồi.",
    "home.featured_title": "Tọa độ hot hit",
    "home.featured_subtitle": "Sài Gòn đi chill",
    "home.view_all": "Xem tất tần tật",
    "home.trust_1_title": "Tự check-in",
    "home.trust_1_desc": "Tới là vào.",
    "home.trust_2_title": "Ship tận cửa",
    "home.trust_2_desc": "Trà sữa, gà rán, snack.",
    "home.trust_3_title": "PS5/Switch",
    "home.trust_3_desc": "Ở lại cày game.",
    "home.amenities_title": "Perks xịn",
    "home.faq_title": "Lưu ý nhỏ nè bồ ơi",
    "home.faq_1_q": "Đặt phòng vài tiếng thui có được hông?",
    "home.faq_1_a": "Được chứ, đặt vài tiếng trốn deadline hay hẹn hò riêng tư đều cực kỳ 'hạt dẻ' nha.",
    "home.faq_2_q": "Làm sao biết phòng còn trống thật hông?",
    "home.faq_2_a": "Hệ thống tự động check lịch real-time, chốt đơn trong một nốt nhạc.",

    // Room Card / Detail
    "room.guests": "Tối đa {guests} bạn",
    "room.beds": "{beds}",
    "room.size": "{size}",
    "room.left": "Chỉ còn {count} phòng",
    "room.left_plural": "Chỉ còn {count} phòng",
    "room.view_details": "Xem chi tiết",
    "room.select": "Chốt phòng",
    "room.selected": "Đã chốt",
    "room.back_to_homestay": "Quay lại {name}",
    "room.full_photo": "Xem ảnh full không che",
    "room.close_photo": "Đóng ảnh",
    "room.details_header": "Room tour chi tiết",
    "room.details_body": "Có sẵn Wi-Fi căng đét, khăn tắm thơm tho, phòng tắm riêng kín đáo, ánh sáng chill chill và tự check-in cực dễ. Phòng trống real-time sẽ được chốt ngay sau khi bồ gửi giờ đặt.",
    "homestay.choose_room": "Chọn phòng hợp gu",
    "homestay.rooms_avail": "Mấy phòng còn trống nè",
    "homestay.what_offers": "Ở đây có sẵn gì?",
    "homestay.short_stay_ready": "Tự check-in (khỏi gặp ai)",
    "homestay.short_stay_desc": "Riêng tư, hướng nội cực thích",
    "homestay.easy_arrival": "Order đồ ăn vô tư",
    "homestay.easy_arrival_desc": "Ship tới tận giường luôn",
    "homestay.book_secure": "Hệ máy game xịn",
    "homestay.book_secure_desc": "Có sẵn Switch/PS4/PS5 chơi tẹt ga",

    // Booking Panel
    "booking.select_room": "Chốt phòng cái đã",
    "booking.guests_label": "Mấy slot đi chung?",
    "booking.date_label": "Ngày đi trốn",
    "booking.checkin_label": "Giờ nhận phòng",
    "booking.checkout_label": "Giờ về nè",
    "booking.duration_label": "Ở bao lâu?",
    "booking.guest_count": "{count} bạn",
    "booking.guest_count_plural": "{count} bạn",
    "booking.max_guests": "Tối đa {count} bạn nha",
    "booking.hourly": "Theo giờ",
    "booking.overnight": "Qua đêm",
    "booking.daily": "Theo ngày",
    "booking.estimated_total": "Tổng thiệt hại",
    "booking.reserve": "Chốt đơn luôn",
    "booking.continue": "Tiếp tục · {price}",
    "booking.back": "Quay lại",
    "booking.invalid_window": "Chọn giờ giấc cho chuẩn nha bồ.",
    "booking.hours_plural": "{count} tiếng",
    "booking.hours_singular": "{count} tiếng",
    "booking.days_plural": "{count} ngày",
    "booking.days_singular": "{count} ngày",
    "booking.nights_plural": "{count} đêm",
    "booking.nights_singular": "{count} đêm",
    "booking.form_name": "Tên bồ là gì?",
    "booking.form_email": "Email nhận code phòng",
    "booking.form_phone": "Số điện thoại liên hệ",
    "booking.form_phone_sub": "(tùy chọn)",
    "booking.form_note": "Nhắn nhủ gì thêm",
    "booking.form_note_sub": "(tùy chọn)",
    "booking.form_note_placeholder": "Mấy giờ tới, đi xe gì để chuẩn bị chỗ đỗ nè...",
    "booking.price_per_hour": "{price} / giờ",
    "booking.rate_hourly": "{price} × {hours} tiếng",
    "booking.rate_hourly_block": "{price} cho {hours}h đầu (thêm {extra}/h)",
    "booking.rate_overnight": "{price} qua đêm ({time})",
    "booking.rate_daily": "{price} × {days} ngày",
    "booking.select_overnight_slot": "Chọn gói qua đêm",
    "ai.initial": "Chào bồ. Hỏi mình về phòng, chính sách hoặc gửi mã booking nha.",
    "ai.title": "Hỗ trợ StayFlow",
    "ai.subtitle": "Phòng, chính sách, booking",
    "ai.placeholder": "Nhập câu hỏi...",
    "ai.error": "Mình chưa trả lời được câu này. Thử lại sau xíu nha.",
    "admin.nav.overview": "Tổng quan",
    "admin.nav.homestays": "Homestay",
    "admin.nav.bookings": "Đặt phòng",
    "admin.nav.payments": "Thanh toán",
    "admin.nav.site_builder": "Dựng website",
    "admin.nav.ai_knowledge": "Kiến thức AI",
    "admin.nav.settings": "Cài đặt",
    "admin.property.label": "Cơ sở đang quản lý",
    "admin.property.manage": "Quản lý cơ sở",
    "admin.user.role": "Chủ nhà",
    "admin.today": "Thứ Năm, 18 tháng 6",
    "admin.sidebar.close": "Đóng thanh bên",
    "admin.sidebar.open": "Mở thanh bên",
    "admin.sidebar.collapse": "Thu gọn thanh bên",
    "admin.sidebar.expand": "Mở rộng thanh bên",
    "admin.sign_out": "Đăng xuất",
    "admin.language_switch": "Switch to English",
    "admin.overview.title": "Tổng quan",
    "admin.overview.description": "Tình hình hôm nay của các cơ sở",
    "admin.overview.manage_properties": "Quản lý cơ sở",
    "admin.stats.revenue_month": "Doanh thu tháng này",
    "admin.stats.occupancy_rate": "Tỷ lệ lấp phòng",
    "admin.stats.active_bookings": "Booking đang hoạt động",
    "admin.stats.pending_payments": "Thanh toán chờ xử lý",
    "admin.stats.live": "Đang chạy",
    "admin.stats.needs_review": "Cần kiểm tra",
    "admin.recent_bookings.title": "Booking gần đây",
    "admin.recent_bookings.description": "Hoạt động mới nhất từ tất cả cơ sở",
    "admin.view_all": "Xem tất cả",
    "admin.table.guest": "Khách",
    "admin.table.property": "Cơ sở",
    "admin.table.total": "Tổng tiền",
    "admin.table.status": "Trạng thái",
    "admin.table.actions": "Thao tác",
    "admin.table.actions_for": "Thao tác cho {ref}",
    "admin.revenue_pulse.title": "Nhịp doanh thu",
    "admin.revenue_pulse.description": "7 ngày gần nhất",
    "admin.revenue_pulse.chart": "Biểu đồ cột doanh thu",
    "admin.revenue_pulse.start": "9 Thg 6",
    "admin.revenue_pulse.end": "15 Thg 6",
    "admin.today_glance.title": "Hôm nay có gì",
    "admin.today_glance.arrivals": "Khách đến",
    "admin.today_glance.departures": "Khách rời đi",
    "admin.today_glance.rooms_occupied": "Phòng đang sử dụng",
    "status.draft": "Bản nháp",
    "status.pending_payment": "Chờ thanh toán",
    "status.paid": "Đã thanh toán",
    "status.confirmed": "Đã xác nhận",
    "status.checked_in": "Đã nhận phòng",
    "status.checked_out": "Đã trả phòng",
    "status.cancelled": "Đã hủy",
    "status.refunded": "Đã hoàn tiền",
    "status.failed": "Thất bại",

    // Language Popup
    "lang_popup.welcome": "Chào mừng bồ đến với StayFlow! 🌟",
    "lang_popup.sub": "Chọn nhanh ngôn ngữ để bắt đầu cuộc hành trình đi trốn deadline nào!",
    "lang_popup.select_vi": "Tiếng Việt chuẩn Gen Z 🇻🇳",
    "lang_popup.select_en": "English (US/UK) 🇬🇧",
  },
};

const dbTranslations: Record<Language, Record<string, string>> = {
  en: {
    "District One Studio": "District 1 Studio",
    "Thao Dien Loft": "Thao Dien Loft",
    "Coastal House": "Coastal House",
    "District 1, Ho Chi Minh City": "District 1, HCMC",
    "Thao Dien, Ho Chi Minh City": "Thao Dien, HCMC",
    "Da Nang, Vietnam": "Da Nang, Vietnam",
    "Compact private studios for work breaks, late arrivals, and short city stays near Ben Thanh.":
      "Cozy private studios near Ben Thanh Market.",
    "Design-led loft rooms for couples, business travelers, and overnight resets in District 2.":
      "Modern loft apartments in Thao Dien.",
    "A simple coastal stay close to the beach and local food.":
      "Cozy coastal home near the beach.",
    "City Nap Studio": "Nap Studio",
    "Work Break Room": "Work Break Room",
    "Loft Bath Room": "Loft Bath Room",
    "Airport Buffer Suite": "Airport Buffer Suite",
    "Standard Room": "Standard Room",
    "Quiet room with blackout curtains, shower, desk, and keyless entry.":
      "Quiet workspace, high-speed Wi-Fi, and private shower.",
    "Simple studio for calls, rest, or a same-day refresh between plans.":
      "Perfect for business calls, day rest, or same-day refresh.",
    "Private loft with soaking tub, soft lighting, and a small work corner.":
      "Private loft with luxury tub, soft lights, and workspace.",
    "Larger studio for luggage, shower, and overnight layovers before early flights.":
      "Spacious room for layovers, luggage storage, and hot shower.",
    "A comfortable room ready to customize.":
      "Private room with self check-in, delivery-friendly setup, and optional console add-ons.",
    "Self check-in": "Self check-in",
    "No staff check-in": "No staff check-in",
    "Food delivery friendly": "Food delivery",
    "Nintendo Switch": "Nintendo Switch",
    "PS4 optional": "PS4 optional",
    "PS5 optional": "PS5 optional",
    "Smart TV": "Smart TV",
    "Day-use desk": "Work desk",
    "Fast Wi-Fi": "Fast Wi-Fi",
    "Fresh towels": "Clean towels",
    "Secure parking": "Parking",
    "Bathtub rooms": "Soaking tub",
    "Motorbike parking": "Bike parking",
    "Room service partners": "Food delivery",
    "Flexible checkout": "Flex check-out",
    "Wi-Fi": "Wi-Fi"
  },
  vi: {
    "District One Studio": "Studio Hướng Nội Quận 1",
    "Thao Dien Loft": "Loft Thảo Điền Siêu Chill",
    "Coastal House": "Homestay Sát Biển Đà Nẵng",
    "District 1, Ho Chi Minh City": "Quận 1, Sài Gòn",
    "Thao Dien, Ho Chi Minh City": "Thảo Điền, Sài Gòn",
    "Da Nang, Vietnam": "Đà Nẵng City",
    "Compact private studios for work breaks, late arrivals, and short city stays near Ben Thanh.":
      "Căn studio riêng tư ngay Quận 1, hợp gu trốn deadline, nghỉ trưa nhanh hay trốn cả thế giới.",
    "Design-led loft rooms for couples, business travelers, and overnight resets in District 2.":
      "Căn loft xịn xò tại Thảo Điền, góc chill cực xịn cho cặp đôi, game thủ hay ở qua đêm.",
    "A simple coastal stay close to the beach and local food.":
      "Homestay ven biển cực chill, bước vài bước là chạm cát biển Đà Nẵng.",
    "City Nap Studio": "Phòng Nghỉ Trưa Nhanh",
    "Work Break Room": "Góc Trốn Deadline",
    "Loft Bath Room": "Loft Bồn Tắm Siêu Chill",
    "Airport Buffer Suite": "Phòng Layover Chờ Bay",
    "Standard Room": "Phòng Basic Tiện Nghi",
    "Quiet room with blackout curtains, shower, desk, and keyless entry.":
      "Góc siêu yên tĩnh, rèm cản sáng 100%, bàn làm việc riêng và self check-in.",
    "Simple studio for calls, rest, or a same-day refresh between plans.":
      "Không gian hoàn hảo để nghỉ trưa, làm việc từ xa hoặc nạp năng lượng chờ kèo đi chơi.",
    "Private loft with soaking tub, soft lighting, and a small work corner.":
      "Bồn tắm nằm cực thư giãn, ánh sáng mờ ảo ấm cúng kèm góc làm việc xinh xắn.",
    "Larger studio for luggage, shower, and overnight layovers before early flights.":
      "Phòng siêu rộng để đống hành lý, tắm rửa nghỉ ngơi trước chuyến bay sớm.",
    "A comfortable room ready to customize.":
      "Phòng cozy tự check-in, order đồ ăn thoải mái và có sẵn hệ máy game.",
    "Self check-in": "Tự nhận phòng (khỏi gặp ai)",
    "No staff check-in": "Không gặp staff (riêng tư 100%)",
    "Food delivery friendly": "Quẩy đồ ăn / Ship tận cửa",
    "Nintendo Switch": "Máy Nintendo Switch",
    "PS4 optional": "Có sẵn PS4",
    "PS5 optional": "Có sẵn PS5",
    "Smart TV": "Smart TV xem Netflix",
    "Day-use desk": "Bàn trốn deadline",
    "Fast Wi-Fi": "Wi-Fi căng đét",
    "Fresh towels": "Khăn tắm thơm tho",
    "Secure parking": "Chỗ đỗ xe an toàn",
    "Bathtub rooms": "Bồn tắm chill chill",
    "Motorbike parking": "Bãi đỗ xe máy",
    "Room service partners": "Gọi ship đồ ăn vặt",
    "Flexible checkout": "Checkout linh hoạt",
    "Wi-Fi": "Wi-Fi căng đét"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [language, setLanguageState] = useState<Language>("en");
  const [siteTheme, setSiteThemeState] = useState<StoredTheme>(DEFAULT_THEME);
  const [themeMode, setThemeModeState] = useState<ThemeMode>(DEFAULT_THEME.mode);
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>("light");
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hostRoute = pathname.startsWith("/admin") || pathname === "/login";
  const effectiveLanguage: Language = hostRoute ? "vi" : language;
  const showLanguagePrompt = !hostRoute;
  const resolvedTheme = useMemo<ResolvedTheme>(
    () => (themeMode === "system" ? systemTheme : themeMode),
    [systemTheme, themeMode],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMounted(true);
      setSystemTheme(getSystemTheme());
      const stored = localStorage.getItem("stayflow_language");
      if (isLanguage(stored)) {
        setLanguageState(stored);
      } else if (showLanguagePrompt) {
        setShowPopup(true);
      }

      const storedMode = localStorage.getItem("stayflow_theme_mode");
      if (isThemeMode(storedMode)) {
        setThemeModeState(storedMode);
      }

      void fetch("/api/settings/theme")
        .then((response) => (response.ok ? response.json() : null))
        .then((theme: StoredTheme | null) => {
          if (!theme) return;
          setSiteThemeState(theme);
          if (!isThemeMode(storedMode)) {
            setThemeModeState(theme.mode);
          }
        })
        .catch(() => undefined);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [showLanguagePrompt]);

  useEffect(() => {
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const syncSystemTheme = () => setSystemTheme(query.matches ? "dark" : "light");
    syncSystemTheme();
    query.addEventListener("change", syncSystemTheme);
    return () => query.removeEventListener("change", syncSystemTheme);
  }, []);

  useEffect(() => {
    applyPreferenceDom(effectiveLanguage, siteTheme, themeMode, resolvedTheme);
  }, [effectiveLanguage, resolvedTheme, siteTheme, themeMode]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("stayflow_language", lang);
    setShowPopup(false);
  };

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
    localStorage.setItem("stayflow_theme_mode", mode);
  };

  const setSiteTheme = (theme: StoredTheme, options?: { persistMode?: boolean }) => {
    setSiteThemeState(theme);
    if (options?.persistMode) {
      setThemeMode(theme.mode);
    }
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const dict = translations[effectiveLanguage];
    let template = dict[key] || translations["en"][key];

    if (!template) {
      const dbDict = dbTranslations[effectiveLanguage];
      template = dbDict?.[key] || key;
    }

    if (replacements) {
      Object.entries(replacements).forEach(([k, v]) => {
        template = template.replace(`{${k}}`, String(v));
      });
    }
    return template;
  };

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setShowPopup(false);
  };

  return (
    <LanguageContext.Provider
      value={{
        language: effectiveLanguage,
        setLanguage,
        t,
        themeMode,
        setThemeMode,
        resolvedTheme,
        siteTheme,
        setSiteTheme,
      }}
    >
      {children}

      {/* Cute Language Selector Modal (Pop-up/Bottom-sheet) */}
      {mounted && showLanguagePrompt && showPopup && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-md transition-all duration-300 md:items-center p-0 md:p-4">
          {/* Animated Modal Container */}
          <div className="w-full max-w-md rounded-t-[2.5rem] md:rounded-[2rem] bg-card p-8 md:p-10 shadow-2xl border border-border flex flex-col items-center text-center animate-in slide-in-from-bottom duration-300 md:zoom-in-95">
            {/* Header Icon */}
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-6 animate-bounce">
              <Globe className="size-8" />
            </div>

            {/* Title & Description */}
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              {translations[language]?.["lang_popup.welcome"] || translations["en"]["lang_popup.welcome"]}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {translations[language]?.["lang_popup.sub"] || translations["en"]["lang_popup.sub"]}
            </p>

            {/* Language Selection Buttons */}
            <div className="mt-8 flex w-full flex-col gap-3">
              <button
                type="button"
                onClick={() => selectLanguage("vi")}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-muted/40 p-4 font-semibold text-foreground transition-all hover:bg-secondary/60 hover:border-primary/40 focus:outline-none group active:scale-98"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">🇻🇳</span>
                  <span>Tiếng Việt</span>
                </span>
                <span className="text-xs font-normal text-muted-foreground group-hover:text-primary">Lựa chọn</span>
              </button>

              <button
                type="button"
                onClick={() => selectLanguage("en")}
                className="flex w-full items-center justify-between rounded-2xl border border-border bg-muted/40 p-4 font-semibold text-foreground transition-all hover:bg-secondary/60 hover:border-primary/40 focus:outline-none group active:scale-98"
              >
                <span className="flex items-center gap-3">
                  <span className="text-2xl">🇬🇧</span>
                  <span>English</span>
                </span>
                <span className="text-xs font-normal text-muted-foreground group-hover:text-primary">Select</span>
              </button>
            </div>

            {/* Decorative Brand Text */}
            <div className="mt-8 flex items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground/60 uppercase">
              <Compass className="size-3.5" />
              <span>StayFlow Saigon</span>
            </div>
          </div>
        </div>
      )}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function usePreferences() {
  return useLanguage();
}
