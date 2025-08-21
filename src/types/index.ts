
import { z } from 'zod';
import { Timestamp } from 'firebase/firestore';

export const TaskCategoryEnum = z.enum([
  // 🔧 Construction & Carpentry
  'Mason',
  'Carpenter', 
  'Plumber',
  'Electrician',
  'Steel fabricator',
  'Tile setter',
  'Painter',
  'Gate installer',
  'Cabinet maker',
  'Modular cabinet installer',
  'Reupholstery worker',
  
  // 🧰 Mechanical & Electrical
  'Automotive mechanic',
  'Auto electrician', 
  'Motorcycle technician',
  'Refrigeration and airconditioning technician',
  'Appliance repair technician',
  
  // 🧼 Services & Maintenance
  'Housekeeper',
  'Janitor',
  'Gardener',
  'Building maintenance technician',
  'Pest control worker',
  'Sewer line cleaner',
  'Sanitation worker',
  
  // 🧑‍🍳 Hospitality & Culinary
  'In home chef service',
  'Cook',
  'Barista',
  'Bartender',
  'House cleaner',
  
  // 💅 Beauty & Wellness
  'Hairdresser',
  'Barber',
  'Nail technician',
  'Massage therapist',
  'Makeup artist',
  'Pet caretaker',
  'Pet groomer',
  'Tour guide',
  
  // 📦 Logistics & Transport
  'Personal driver',
  'Forklift operator',
  'Delivery rider',
  'Warehouse personnel',
  'Truck driver',
  'Crane operator',
  
  // ⚙️ Technical and Industrial
  'Aircon cleaner',
  'Aircon installer technician',
  'Field service Computer technician',
  'CCTv installer',
  
  // 🏗️ High-risk Construction
  'Scaffolder',
  'Rigger/signalman for heavy lifting',
  'Structural welder',
  'Tunnel boring machine operator',
  'Demolition specialist',
  
  // 🛠️ Precision Trades
  'Watch repair technician',
  'Jeweler or stone setter',
  'Mold and die maker',
  'Precision tool grinder',
  'Orthotics/prosthetics technician',
  
  // 🚢 Maritime
  'Charter ship captain',
  'Charter pilot',
  'Marine electrician',
  'Marine diesel mechanic',
  'Lifeboat/rescue boat operator',
  'Able-bodied seaman',
  'Underwater welder',
  
  // 🖥️ Tech-Related
  'Smart device installer',
  'Fiber optic technician',
  'Drone operator/pilot',
  '3D printing technician',
  'Solar panel installer and technician',
  'AV/lighting systems integrator',
  
  // 🧑‍⚕️ Healthcare Support
  'Home visit physician',
  'Home care nurse',
  'Home service vet',
  'Medical laboratory technician',
  'X-ray technician',
  'Caregiver with NC II',
  
  // 🏥 Medical & Wellness Home Services
  'Home Service Vet',
  'Home Service Physician',
  'Nurse at Home',
  'Physical Therapist',
  'Midwife / Home Birth Assistant',
  'Mobile Laboratory / Diagnostic Services',
  'Vaccination at Home',
  
  // 🧪 Food & Beverage (Specialty)
  'Chocolatier',
  'Artisan baker',
  'Wine/sake sommelier',
  'Brewing technician',
  
  // 📚 Education and Training
  'Business coach',
  'Language Tutor',
  'Music tutor',
  'PE instructor',
  'Sports coach/ PE trainer',
  'Personal health instructor',
  'Life skill trainer',
  'Corporate trainer',
  'Workshop facilitator',
  
  // 🎉 Events Planning and Hospitality
  'Events coordinator',
  'Photographer /videographer',
  'Host/Emcee',
  'Floral arrangement specialist',
  'Event stylist / coordinator',
  'Lights and sound technician',
  'Hair and makeup artist',
  'Invitation and souvenir designer',
  'Venue coordinator',
  
  // 🎨 Creative Arts, Media and Entertainment Services
  'Commercial/print ad model',
  'Fitness model',
  'Pageant coach',
  'Social media /influencer model',
  
  // Legacy categories (keeping for backward compatibility)
  'Home Services',
  'Delivery',
  'Tutoring', 
  'Events',
  'Other'
]);
export type TaskCategory = z.infer<typeof TaskCategoryEnum>;

export type TaskStatus = 'open' | 'claimed' | 'completed';

export interface Task {
  id: string;
  type: 'task' | 'service';
  title: string;
  category: TaskCategory;
  location: string;
  pay: number;
  description: string;
  authorId: string;
  authorName: string;
  authorPhotoURL?: string;
  createdAt: Timestamp;
  status: TaskStatus;
  taskerId?: string;
  taskerName?: string;
  taskerPhotoURL?: string;
  clientHasReviewed?: boolean;
  taskerHasReviewed?: boolean;
}

export interface Review {
    id?: string;
    taskId: string;
    revieweeId: string; // The user being reviewed
    reviewerId: string; // The user who wrote the review
    reviewerName: string;
    rating: number; // 1-5
    comment?: string;
    createdAt: Timestamp;
}

// Verification types
export const VerificationTypeEnum = z.enum(['selfie', 'id-document']);
export type VerificationType = z.infer<typeof VerificationTypeEnum>;

export const DocumentTypeEnum = z.enum(['government-id', 'company-id', 'passport']);
export type DocumentType = z.infer<typeof DocumentTypeEnum>;

export interface VerificationStatus {
    isVerified: boolean;
    verificationType: VerificationType;
    verifiedAt?: string;
    documentType?: DocumentType;
    confidence?: number;
    livenessScore?: number;
    qualityScore?: number;
    verificationReasons?: string[];
    failedAttempts?: number;
    lastAttemptAt?: string;
}

export interface UserVerification {
    userId: string;
    photoURL?: string;
    idDocumentURL?: string;
    verificationStatus: VerificationStatus;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

// Notification types
export interface Notification {
  id?: string;
  userId: string;
  type: 'task_accepted' | 'task_completed' | 'new_review' | 'task_reminder' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>; // Additional data like taskId, reviewId, etc.
  isRead: boolean;
  createdAt: Timestamp;
}

export const NotificationTypeEnum = z.enum(['task_accepted', 'task_completed', 'new_review', 'task_reminder', 'system']);

// Reporting types
export interface Report {
  id?: string;
  reporterId: string;
  reporterName: string;
  reportedUserId?: string;
  reportedTaskId?: string;
  reportType: 'inappropriate_content' | 'spam' | 'harassment' | 'fake_profile' | 'scam' | 'other';
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const ReportTypeEnum = z.enum(['inappropriate_content', 'spam', 'harassment', 'fake_profile', 'scam', 'other']);
export const ReportStatusEnum = z.enum(['pending', 'reviewed', 'resolved', 'dismissed']);

// Bonus/Pot Money types
export interface PotMoney {
  id?: string;
  totalAmount: number;
  currency: string;
  lastUpdated: Timestamp;
  isActive: boolean;
  distributionRate: number;
  minTaskAmount: number;
  maxBonusAmount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Bonus {
  id?: string;
  taskId: string;
  taskerId: string;
  taskerName: string;
  clientId: string;
  clientName: string;
  baseTaskAmount: number;
  tipAmount: number;
  bonusAmount: number;
  totalAmount: number;
  finalAmount: number;
  potMoneyAvailable: number;
  bonusPercentage: number;
  isRandomlyTriggered: boolean;
  description: string;
  metadata: {
    taskTitle: string;
    potMoneyId: string;
    calculationMethod: string;
  };
  status: 'pending' | 'processed' | 'failed';
  createdAt: Timestamp;
  processedAt?: Timestamp;
}

export interface PaymentBreakdown {
  id?: string;
  taskId: string;
  taskerId: string;
  taskerName: string;
  clientId: string;
  clientName: string;
  basePayment: number;
  tipAmount: number;
  bonusAmount: number;
  totalAmount: number;
  currency: string;
  breakdown: {
    basePayment: {
      amount: number;
      description: string;
    };
    bonus: {
      amount: number;
      description: string;
      isRandom: boolean;
    };
    tip: {
      amount: number;
      description: string;
    };
  };
  status: 'pending' | 'completed' | 'failed';
  createdAt: Timestamp;
  completedAt?: Timestamp;
}

// Scheduling/Calendar Types
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type AppointmentType = 'consultation' | 'service' | 'meeting' | 'follow_up';

export interface Appointment {
  id?: string;
  clientId: string;
  clientName: string;
  taskerId: string;
  taskerName: string;
  taskId?: string; // Optional link to a specific task
  title: string;
  description?: string;
  appointmentType: AppointmentType;
  startTime: Timestamp;
  endTime: Timestamp;
  duration: number; // in minutes
  location: string;
  status: AppointmentStatus;
  notes?: string;
  reminderSent: boolean;
  reminderSentAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AvailabilitySlot {
  id?: string;
  taskerId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ScheduleBlock {
  id?: string;
  taskerId: string;
  startDate: Timestamp;
  endDate: Timestamp;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isBlocked: boolean;
  reason?: string;
  createdAt: Timestamp;
}

// Payment Method Types
export type PaymentMethod = 'gcash' | 'paymaya' | 'stripe' | 'paypal' | 'cash';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled';

export interface PaymentMethodConfig {
  id: string;
  name: string;
  type: PaymentMethod;
  isEnabled: boolean;
  isDefault: boolean;
  config: {
    merchantId?: string;
    apiKey?: string;
    secretKey?: string;
    webhookUrl?: string;
    sandboxMode: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface PaymentTransaction {
  id?: string;
  taskId?: string;
  appointmentId?: string;
  payerId: string;
  payerName: string;
  payeeId: string;
  payeeName: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string; // External payment provider transaction ID
  referenceNumber?: string; // Internal reference number
  description: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
  processedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// GCash specific types
export interface GCashPaymentRequest {
  amount: number;
  currency: string;
  referenceNumber: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  redirectUrl: string;
  webhookUrl?: string;
}

export interface GCashPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  errorMessage?: string;
}

// PayMaya specific types
export interface PayMayaPaymentRequest {
  amount: number;
  currency: string;
  referenceNumber: string;
  description: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  redirectUrl: string;
  webhookUrl?: string;
}

export interface PayMayaPaymentResponse {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  qrCode?: string;
  errorMessage?: string;
}
