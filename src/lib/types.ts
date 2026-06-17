export type Homestay = {
  id: string;
  slug: string;
  name: string;
  location: string;
  description: string;
  rating: number;
  reviewCount: number;
  priceFrom: number;
  image: string;
  gallery: string[];
  tags: string[];
  amenities: string[];
  rooms: Room[];
};

export type OvernightOption = {
  id: string;
  labelEn: string;
  labelVi: string;
  checkInTime: string;
  checkOutTime: string;
  price: number;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  guests: number;
  beds: string;
  size: string;
  hourlyPrice?: number;
  overnightPrice?: number;
  dailyPrice: number;
  hourlyBlockHours: number;
  hourlyBlockPrice: number;
  hourlyExtraHourPrice: number;
  overnightOptions: OvernightOption[];
  minHours: number;
  maxHours: number;
  price: number;
  image: string;
  gallery?: string[];
  remaining: number;
};

export type StayType = "hourly" | "overnight" | "daily";

export type BookingStatus =
  | "draft"
  | "pending_payment"
  | "paid"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "refunded"
  | "failed";
