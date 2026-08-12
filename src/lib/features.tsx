import React from "react";
import { Lock } from "lucide-react";

export type FeatureKey =
  | "appointment_booking"
  | "custom_services"
  | "rating_feedback"
  | "reminders"
  | "offers_campaigns"
  | "selfie_upload"
  | "previous_looks"
  | "ai_rag_chatbot"
  | "analytics_insights";

export interface FeatureMeta {
  key: FeatureKey;
  label: string;
  description: string;
  category: "core" | "engagement" | "ai_advanced" | "stylist";
}

export const FEATURE_MANIFEST: Record<FeatureKey, FeatureMeta> = {
  appointment_booking: {
    key: "appointment_booking",
    label: "Appointment Booking & Calendar Queue",
    description: "Online and walk-in appointment scheduling with live timetable matrix.",
    category: "core",
  },
  custom_services: {
    key: "custom_services",
    label: "Services Catalog & Custom Pricing",
    description: "Manage categories, service durations, standard and offer prices.",
    category: "core",
  },
  rating_feedback: {
    key: "rating_feedback",
    label: "Customer Rating & Review Requests",
    description: "Post-appointment rating collection and feedback logging.",
    category: "engagement",
  },
  reminders: {
    key: "reminders",
    label: "Automated WhatsApp Reminders",
    description: "Automated appointment confirmation & visit reminder triggers.",
    category: "engagement",
  },
  offers_campaigns: {
    key: "offers_campaigns",
    label: "Offers, Promo Code & Marketing Campaigns",
    description: "Broadcasting promotional discounts and seasonal customer offers.",
    category: "engagement",
  },
  selfie_upload: {
    key: "selfie_upload",
    label: "Stylist Finished-Look Photo Upload",
    description: "Upload customer haircut/style photo at barber station with consent.",
    category: "stylist",
  },
  previous_looks: {
    key: "previous_looks",
    label: "Customer Past Haircut Look Gallery",
    description: "View past haircut history and look photos attached to customer profile.",
    category: "stylist",
  },
  ai_rag_chatbot: {
    key: "ai_rag_chatbot",
    label: "11za AI NLU Booking Chatbot",
    description: "Automated AI conversational booking and RAG system instructions.",
    category: "ai_advanced",
  },
  analytics_insights: {
    key: "analytics_insights",
    label: "Advanced Revenue & Business Intelligence",
    description: "Deep analytics, peak hour heatmaps, ARPU, and staff yield reports.",
    category: "ai_advanced",
  },
};

export const DEFAULT_PLAN_FEATURES: Record<string, FeatureKey[]> = {
  basic: [
    "appointment_booking",
    "custom_services",
    "rating_feedback",
  ],
  pro: [
    "appointment_booking",
    "custom_services",
    "rating_feedback",
    "reminders",
    "offers_campaigns",
    "selfie_upload",
    "previous_looks",
  ],
  enterprise: [
    "appointment_booking",
    "custom_services",
    "rating_feedback",
    "reminders",
    "offers_campaigns",
    "selfie_upload",
    "previous_looks",
    "ai_rag_chatbot",
    "analytics_insights",
  ],
};

/**
 * Check if a specific feature is enabled for a given salon.
 * Evaluates in order:
 * 1. Direct salon feature overrides (if set by Super Admin)
 * 2. Plan default feature list
 * 3. Default fallback (true for core features)
 */
export function isFeatureEnabled(salon: any, featureKey: FeatureKey): boolean {
  if (!salon) return true;

  // 1. Check Granular Salon Override
  const overrides = salon.feature_overrides || salon.featureOverrides || {};
  if (typeof overrides[featureKey] === "boolean") {
    return overrides[featureKey];
  }

  // 2. Check Plan Level Feature List
  const plan = (salon.subscription_plan || salon.subscriptionPlan || "pro").toLowerCase();
  const planFeatures = DEFAULT_PLAN_FEATURES[plan] || DEFAULT_PLAN_FEATURES.pro;

  return planFeatures.includes(featureKey);
}

/**
 * Get full status of all features for a salon
 */
export function getSalonFeatureStates(salon: any): Record<FeatureKey, boolean> {
  const result: Record<string, boolean> = {};
  const allKeys = Object.keys(FEATURE_MANIFEST) as FeatureKey[];
  for (const key of allKeys) {
    result[key] = isFeatureEnabled(salon, key);
  }
  return result as Record<FeatureKey, boolean>;
}

/**
 * React Component to conditionally render content based on Feature Flag
 */
export function FeatureGate({
  feature,
  salon,
  fallback,
  children,
}: {
  feature: FeatureKey;
  salon?: any;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) {
  const enabled = isFeatureEnabled(salon, feature);

  if (enabled) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  const meta = FEATURE_MANIFEST[feature];

  return (
    <div className="p-6 rounded-[14px] bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-12 h-12 rounded-[10px] bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 flex items-center justify-center">
        <Lock className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20 uppercase tracking-wider">
          Plan Upgrade Required
        </span>
        <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1">
          {meta?.label || "Feature Restricted"} Is Locked
        </h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
          {meta?.description || "This feature is not enabled for your salon's current subscription plan."}
        </p>
      </div>
    </div>
  );
}
