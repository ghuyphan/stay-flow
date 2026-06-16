"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Compass, Globe } from "lucide-react";

export type Language = "en" | "vi";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => string;
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Footer
    "nav.stays": "Stays",
    "nav.for_hosts": "For hosts",
    "nav.support": "Support",
    "footer.copyright": "© 2026 StayFlow. All rights reserved.",

    // Homepage
    "hero.location": "District 1, Ho Chi Minh City",
    "hero.title": "Book a private room by the hour.",
    "hero.subtitle": "Hourly, overnight, and daily stays with clear pricing.",
    "search.where": "Where",
    "search.where_placeholder": "District 1 or Thao Dien",
    "search.date": "Date",
    "search.guests": "Guests",
    "search.submit": "Search",
    "homestays.eyebrow": "Explore",
    "homestays.title": "Find your kind of stay",
    "homestays.desc": "From cool mountain mornings to lantern-lit river evenings.",
    "homestays.stays_count": "{count} stays",
    "homestays.filters": "Filters",
    "homestays.no_results": "No stays match those filters.",
    "home.featured_title": "Featured stays",
    "home.featured_subtitle": "Ho Chi Minh City",
    "home.view_all": "View all",
    "home.trust_1_title": "Book exact hours",
    "home.trust_1_desc": "Choose hourly, overnight, or daily windows.",
    "home.trust_2_title": "Private and reviewed",
    "home.trust_2_desc": "Listings are curated before they go live.",
    "home.trust_3_title": "Server-confirmed payment",
    "home.trust_3_desc": "Booking and payment state stay authoritative.",
    "home.amenities_title": "Good for short stays",
    "home.faq_title": "Before guests arrive",
    "home.faq_1_q": "Can guests book only a few hours?",
    "home.faq_1_a": "Yes. Hourly windows are priced separately from overnight and daily stays.",
    "home.faq_2_q": "When is availability checked?",
    "home.faq_2_a": "The server checks exact check-in and check-out times before creating a booking.",

    // Room Card / Detail
    "room.guests": "Up to {guests} guests",
    "room.beds": "{beds}",
    "room.size": "{size}",
    "room.left": "{count} room left",
    "room.left_plural": "{count} rooms left",
    "room.view_details": "View room",
    "room.back_to_homestay": "Back to {name}",
    "room.details_header": "Room details",
    "room.details_body": "Includes high-speed Wi-Fi, fresh towels, private bathroom access, soft lighting, and flexible self check-in. Final availability is confirmed when you submit your time.",
    "homestay.choose_room": "Choose your room",
    "homestay.rooms_avail": "Rooms available for your stay",
    "homestay.what_offers": "What this place offers",
    "homestay.short_stay_ready": "Short-stay ready",
    "homestay.short_stay_desc": "Hourly, overnight, daily",
    "homestay.easy_arrival": "Easy arrival",
    "homestay.easy_arrival_desc": "Pick the exact time",
    "homestay.book_secure": "Book securely",
    "homestay.book_secure_desc": "Protected payment",

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
    "booking.hourly": "hourly",
    "booking.overnight": "overnight",
    "booking.daily": "daily",
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

    // Language Popup
    "lang_popup.welcome": "Welcome to StayFlow! 🌟",
    "lang_popup.sub": "Please select your preferred language to customize your booking experience.",
    "lang_popup.select_vi": "Tiếng Việt (Vietnamese)",
    "lang_popup.select_en": "English (US/UK)",
  },
  vi: {
    // Nav & Footer
    "nav.stays": "Phòng nghỉ",
    "nav.for_hosts": "Dành cho chủ nhà",
    "nav.support": "Hỗ trợ",
    "footer.copyright": "© 2026 StayFlow. Bảo lưu mọi quyền.",

    // Homepage
    "hero.location": "Quận 1, Thành phố Hồ Chí Minh",
    "hero.title": "Đặt phòng riêng tư theo giờ.",
    "hero.subtitle": "Nghỉ theo giờ, qua đêm hoặc theo ngày với mức giá minh bạch.",
    "search.where": "Điểm đến",
    "search.where_placeholder": "Quận 1 hoặc Thảo Điền",
    "search.date": "Ngày nhận",
    "search.guests": "Số khách",
    "search.submit": "Tìm kiếm",
    "homestays.eyebrow": "Khám phá",
    "homestays.title": "Tìm kiếm phòng nghỉ phù hợp",
    "homestays.desc": "Từ những buổi sáng vùng cao trong lành đến những buổi chiều lung linh bên sông.",
    "homestays.stays_count": "{count} homestay",
    "homestays.filters": "Bộ lọc",
    "homestays.no_results": "Không tìm thấy homestay phù hợp.",
    "home.featured_title": "Địa điểm nổi bật",
    "home.featured_subtitle": "Thành phố Hồ Chí Minh",
    "home.view_all": "Xem tất cả",
    "home.trust_1_title": "Đặt chính xác giờ",
    "home.trust_1_desc": "Tự do chọn khung giờ theo giờ, qua đêm hoặc theo ngày.",
    "home.trust_2_title": "Riêng tư & đã kiểm duyệt",
    "home.trust_2_desc": "Các phòng được thẩm định kỹ lưỡng trước khi đưa lên hệ thống.",
    "home.trust_3_title": "Thanh toán an toàn",
    "home.trust_3_desc": "Thông tin đặt phòng và trạng thái thanh toán được xác thực bảo mật.",
    "home.amenities_title": "Tiện nghi nghỉ dưỡng ngắn ngày",
    "home.faq_title": "Thông tin cần biết trước khi đến",
    "home.faq_1_q": "Tôi có thể đặt phòng chỉ vài giờ không?",
    "home.faq_1_a": "Có. Các khung giờ lẻ được tính phí theo gói riêng biệt so với qua đêm hoặc theo ngày.",
    "home.faq_2_q": "Tình trạng trống phòng được kiểm tra khi nào?",
    "home.faq_2_a": "Hệ thống sẽ đối soát thời gian nhận và trả phòng thực tế của bạn trước khi xác nhận đơn đặt.",

    // Room Card / Detail
    "room.guests": "Tối đa {guests} khách",
    "room.beds": "{beds}",
    "room.size": "{size}",
    "room.left": "Còn {count} phòng trống",
    "room.left_plural": "Còn {count} phòng trống",
    "room.view_details": "Xem chi tiết",
    "room.back_to_homestay": "Quay lại {name}",
    "room.details_header": "Thông tin phòng chi tiết",
    "room.details_body": "Bao gồm Wi-Fi tốc độ cao, khăn tắm sạch, lối vào phòng tắm riêng tư, ánh sáng ấm cúng và tự nhận phòng linh hoạt. Tình trạng phòng trống thực tế được cập nhật sau khi bạn gửi thời gian đặt.",
    "homestay.choose_room": "Lựa chọn phòng của bạn",
    "homestay.rooms_avail": "Danh sách phòng còn trống",
    "homestay.what_offers": "Tiện ích sẵn có tại đây",
    "homestay.short_stay_ready": "Sẵn sàng cho kỳ nghỉ ngắn",
    "homestay.short_stay_desc": "Theo giờ, qua đêm, ngày",
    "homestay.easy_arrival": "Đón tiếp dễ dàng",
    "homestay.easy_arrival_desc": "Chọn đúng khung giờ của bạn",
    "homestay.book_secure": "Đặt phòng bảo mật",
    "homestay.book_secure_desc": "Đảm bảo giao dịch an toàn",

    // Booking Panel
    "booking.select_room": "Chọn loại phòng",
    "booking.guests_label": "Số khách",
    "booking.date_label": "Ngày nhận",
    "booking.checkin_label": "Giờ nhận",
    "booking.checkout_label": "Ngày trả",
    "booking.duration_label": "Thời gian",
    "booking.guest_count": "{count} khách",
    "booking.guest_count_plural": "{count} khách",
    "booking.max_guests": "Tối đa {count} khách",
    "booking.hourly": "Theo giờ",
    "booking.overnight": "Qua đêm",
    "booking.daily": "Theo ngày",
    "booking.estimated_total": "Tổng tạm tính",
    "booking.reserve": "Xác nhận đặt",
    "booking.continue": "Tiếp tục · {price}",
    "booking.back": "Quay lại",
    "booking.invalid_window": "Vui lòng chọn khung giờ hợp lệ.",
    "booking.hours_plural": "{count} tiếng",
    "booking.hours_singular": "{count} tiếng",
    "booking.days_plural": "{count} ngày",
    "booking.days_singular": "{count} ngày",
    "booking.nights_plural": "{count} đêm",
    "booking.nights_singular": "{count} đêm",
    "booking.form_name": "Họ và tên",
    "booking.form_email": "Địa chỉ email",
    "booking.form_phone": "Số điện thoại",
    "booking.form_phone_sub": "(tùy chọn)",
    "booking.form_note": "Ghi chú thêm",
    "booking.form_note_sub": "(tùy chọn)",
    "booking.form_note_placeholder": "Giờ check-in dự kiến, biển số xe...",
    "booking.price_per_hour": "{price} / giờ",
    "booking.rate_hourly": "{price} × {hours} giờ",
    "booking.rate_hourly_block": "{price} cho {hours}h đầu (thêm {extra}/h)",
    "booking.rate_overnight": "{price} qua đêm ({time})",
    "booking.rate_daily": "{price} × {days} ngày",
    "booking.select_overnight_slot": "Chọn gói qua đêm",

    // Language Popup
    "lang_popup.welcome": "Chào mừng đến với StayFlow! 🌟",
    "lang_popup.sub": "Vui lòng lựa chọn ngôn ngữ phù hợp để tối ưu trải nghiệm đặt phòng của bạn.",
    "lang_popup.select_vi": "Tiếng Việt (Vietnamese)",
    "lang_popup.select_en": "English (US/UK)",
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
      "Comfortable room ready for check-in.",
    "Self check-in": "Self check-in",
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
    "District One Studio": "Studio Quận 1",
    "Thao Dien Loft": "Loft Thảo Điền",
    "Coastal House": "Căn Hộ Đà Nẵng",
    "District 1, Ho Chi Minh City": "Quận 1, TP.HCM",
    "Thao Dien, Ho Chi Minh City": "Thảo Điền, TP.HCM",
    "Da Nang, Vietnam": "Đà Nẵng, Việt Nam",
    "Compact private studios for work breaks, late arrivals, and short city stays near Ben Thanh.":
      "Căn hộ studio riêng tư, tiện nghi sát chợ Bến Thành.",
    "Design-led loft rooms for couples, business travelers, and overnight resets in District 2.":
      "Phòng loft sang trọng thích hợp nghỉ qua đêm tại Thảo Điền.",
    "A simple coastal stay close to the beach and local food.":
      "Nhà ven biển ấm cúng, cách bãi tắm vài bước chân.",
    "City Nap Studio": "Phòng Nghỉ Trưa",
    "Work Break Room": "Phòng Làm Việc",
    "Loft Bath Room": "Phòng Loft Bồn Tắm",
    "Airport Buffer Suite": "Phòng Chờ Bay",
    "Standard Room": "Phòng Tiêu Chuẩn",
    "Quiet room with blackout curtains, shower, desk, and keyless entry.":
      "Phòng yên tĩnh, rèm cản sáng, bàn làm việc và vòi sen riêng.",
    "Simple studio for calls, rest, or a same-day refresh between plans.":
      "Phù hợp nghỉ trưa, làm việc từ xa hoặc nạp năng lượng trong ngày.",
    "Private loft with soaking tub, soft lighting, and a small work corner.":
      "Bồn tắm ngâm mình thư giãn, ánh sáng ấm cúng và góc làm việc nhỏ.",
    "Larger studio for luggage, shower, and overnight layovers before early flights.":
      "Không gian rộng rãi để hành lý, tắm rửa nghỉ ngơi trước chuyến bay.",
    "A comfortable room ready to customize.":
      "Phòng sạch sẽ, đầy đủ tiện nghi cơ bản.",
    "Self check-in": "Tự nhận phòng",
    "Smart TV": "Tivi thông minh",
    "Day-use desk": "Bàn làm việc",
    "Fast Wi-Fi": "Wi-Fi tốc độ cao",
    "Fresh towels": "Khăn tắm sạch",
    "Secure parking": "Bãi đỗ xe",
    "Bathtub rooms": "Bồn tắm nằm",
    "Motorbike parking": "Đỗ xe máy",
    "Room service partners": "Ship đồ ăn",
    "Flexible checkout": "Checkout linh hoạt",
    "Wi-Fi": "Wi-Fi"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("stayflow_language");
    if (stored === "en" || stored === "vi") {
      setLanguageState(stored);
    } else {
      setShowPopup(true);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("stayflow_language", lang);
  };

  const t = (key: string, replacements?: Record<string, string | number>): string => {
    const dict = translations[language];
    let template = dict[key] || translations["en"][key];

    if (!template) {
      const dbDict = dbTranslations[language];
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
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}

      {/* Cute Language Selector Modal (Pop-up/Bottom-sheet) */}
      {mounted && showPopup && (
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
