export const layoutSectionIds = [
  "hero",
  "search",
  "rooms",
  "trust",
  "gallery",
  "amenities",
  "faq",
] as const;

export type LayoutSectionId = (typeof layoutSectionIds)[number];
export type LayoutPageId = "home" | "homestays" | "detail";

export type LayoutSectionDefinition = {
  id: string;
  name: string;
  description: string;
  defaultEnabled: boolean;
};

export const layoutSectionDefinitions: LayoutSectionDefinition[] = [
  {
    id: "hero",
    name: "Hero đầu trang",
    description: "Ảnh mở đầu lớn, tiêu đề chính và lời chào bán đầu tiên.",
    defaultEnabled: true,
  },
  {
    id: "search",
    name: "Thanh tìm kiếm",
    description: "Khối chọn địa điểm và ngày ngay dưới hero.",
    defaultEnabled: true,
  },
  {
    id: "rooms",
    name: "Phòng nổi bật",
    description: "Thẻ công khai cho các cơ sở lưu trú ngắn hạn.",
    defaultEnabled: true,
  },
  {
    id: "trust",
    name: "Điểm tin cậy",
    description: "Các lợi thế ngắn về tự nhận phòng, giao đồ ăn và riêng tư.",
    defaultEnabled: true,
  },
  {
    id: "gallery",
    name: "Bộ sưu tập ảnh",
    description: "Dải ảnh gọn dùng hình của cơ sở.",
    defaultEnabled: false,
  },
  {
    id: "amenities",
    name: "Tiện ích",
    description: "Tiện ích hợp khách trẻ như máy game, giao đồ ăn và tự nhận phòng.",
    defaultEnabled: false,
  },
  {
    id: "faq",
    name: "Câu hỏi thường gặp",
    description: "Ghi chú ngắn về kỳ vọng và cách khách đến nhận phòng.",
    defaultEnabled: false,
  },
];

export const layoutPageDefinitions: Record<LayoutPageId, {
  name: string;
  description: string;
  sections: LayoutSectionDefinition[];
}> = {
  home: {
    name: "Trang chủ",
    description: "Landing page chính, hero, tìm kiếm và các khối giới thiệu.",
    sections: layoutSectionDefinitions,
  },
  homestays: {
    name: "Danh sách phòng",
    description: "Trang /homestays: tiêu đề, tìm kiếm, số kết quả và lưới phòng.",
    sections: [
      {
        id: "listingHeader",
        name: "Tiêu đề danh sách",
        description: "Eyebrow, tiêu đề và nút lọc trên đầu trang danh sách.",
        defaultEnabled: true,
      },
      {
        id: "listingSearch",
        name: "Tìm kiếm danh sách",
        description: "Thanh tìm kiếm gọn phía trên kết quả.",
        defaultEnabled: true,
      },
      {
        id: "resultCount",
        name: "Số kết quả",
        description: "Dòng hiển thị tổng số homestay khớp bộ lọc.",
        defaultEnabled: true,
      },
      {
        id: "resultGrid",
        name: "Lưới homestay",
        description: "Các thẻ homestay trên trang danh sách.",
        defaultEnabled: true,
      },
    ],
  },
  detail: {
    name: "Chi tiết homestay",
    description: "Trang từng homestay: hero ảnh, tiện ích, phòng và khung đặt.",
    sections: [
      {
        id: "detailHero",
        name: "Hero chi tiết",
        description: "Ảnh lớn, tên homestay, vị trí, rating và mô tả ngắn.",
        defaultEnabled: true,
      },
      {
        id: "detailAmenities",
        name: "Tiện ích nổi bật",
        description: "Dòng tiện ích ngay dưới hero.",
        defaultEnabled: true,
      },
      {
        id: "detailRooms",
        name: "Danh sách phòng",
        description: "Các phòng có thể chọn trong homestay.",
        defaultEnabled: true,
      },
      {
        id: "detailBooking",
        name: "Khung đặt phòng",
        description: "Panel chọn ngày, giờ, khách và gửi booking.",
        defaultEnabled: true,
      },
    ],
  },
};

export function getLayoutSectionDefinition(id: string) {
  return layoutSectionDefinitions.find((section) => section.id === id);
}

export function getLayoutPageSectionDefinition(page: LayoutPageId, id: string) {
  return layoutPageDefinitions[page].sections.find((section) => section.id === id);
}
