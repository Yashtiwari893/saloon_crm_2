// TypeScript Definitions for WhatsApp-First Salon Management System SaaS

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
export type BookingSource = 'whatsapp' | 'walk_in' | 'phone' | 'web';
export type BarberStatus = 'active' | 'on_break' | 'off' | 'inactive';
export type CustomerGender = 'male' | 'female' | 'other' | 'unspecified';
export type ServiceCategory = 'Hair' | 'Beard' | 'Facial' | 'Spa' | 'Massage' | 'Combo';

export interface Salon {
  id: string;
  name: string;
  slug: string;
  phoneNumber: string;
  whatsappOrigin?: string;
  whatsappAuthToken?: string;
  address: string;
  city: string;
  logoUrl?: string;
  currency: string;
  openingTime: string; // HH:mm:ss
  closingTime: string; // HH:mm:ss
  slotIntervalMinutes: number;
  isActive: boolean;
}

export interface Customer {
  id: string;
  salonId: string;
  name: string;
  phoneNumber: string;
  whatsappNumber: string;
  email?: string;
  gender: CustomerGender;
  birthday?: string;
  notes?: string;
  loyaltyPoints: number;
  totalVisits: number;
  totalSpend: number;
  lastVisitAt?: string;
  favouriteBarberId?: string;
  favouriteBarberName?: string;
  preferredServices?: string[];
  isVip: boolean;
  createdAt: string;
}

export interface Barber {
  id: string;
  salonId: string;
  name: string;
  phoneNumber?: string;
  avatarUrl?: string;
  experienceYears: number;
  rating: number;
  status: BarberStatus;
  weeklyOffDay: number; // 0=Sunday, 1=Monday...
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  skills: string[];
  bio?: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  salonId: string;
  name: string;
  category: ServiceCategory;
  description?: string;
  durationMinutes: number;
  price: number;
  discountPrice?: number;
  imageUrl?: string;
  isPopular: boolean;
  assignedBarberIds?: string[];
  isActive: boolean;
}

export interface BookingService {
  id: string;
  bookingId?: string;
  serviceId?: string;
  serviceName: string;
  durationMinutes?: number;
  price: number;
}

export interface Booking {
  id: string;
  salonId: string;
  bookingCode: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  barberId: string;
  barberName: string;
  serviceId: string;
  serviceName: string;
  services?: BookingService[];
  servicesList?: BookingService[];
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalDurationMinutes: number;
  totalPrice: number;
  status: BookingStatus;
  source: BookingSource;
  notes?: string;
  createdAt: string;
}

export interface SalonAnalytics {
  todayRevenue: number;
  todayBookingsCount: number;
  activeBarbersCount: number;
  totalBarbersCount: number;
  activeCustomersCount: number;
  vipCustomersCount: number;
  monthlyRevenueTotal: number;
  popularServices: { serviceName: string; count: number; revenue: number }[];
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'booking' | 'cancellation' | 'reschedule' | 'alert';
  isRead: boolean;
  linkUrl?: string;
  createdAt: string;
}

export interface WhatsAppConversationLog {
  id: string;
  salonId?: string;
  messageId: string;
  fromNumber: string;
  toNumber: string;
  senderName: string;
  contentType: string;
  contentText: string;
  eventType: string;
  isIn24Window: boolean;
  autoRespondSent: boolean;
  responseSentAt?: string;
  createdAt: string;
}
