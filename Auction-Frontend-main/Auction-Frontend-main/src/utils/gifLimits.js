export const GIF_LIMITS = {
  NO_SUBSCRIPTION: {
    maxFileSize: 2 * 1024 * 1024, // 2MB
    maxGifsPerCampaign: 3,
    maxCampaigns: 1,
    label: "Free (No Subscription)",
  },
  "3_MONTHS": {
    maxFileSize: 5 * 1024 * 1024,
    maxGifsPerCampaign: 10,
    maxCampaigns: 10,
    label: "3-Month Plan",
  },
  "6_MONTHS": {
    maxFileSize: 10 * 1024 * 1024,
    maxGifsPerCampaign: 20,
    maxCampaigns: 20,
    label: "6-Month Plan",
  },
  "12_MONTHS": {
    maxFileSize: 20 * 1024 * 1024,
    maxGifsPerCampaign: 50,
    maxCampaigns: 999,
    label: "12-Month Plan",
  },
};
export const getGifLimits = (subscription) => {
  if (!subscription || subscription.status !== "active") {
    return GIF_LIMITS.NO_SUBSCRIPTION;
  }

  const durationMonths = parseInt(
    subscription.durationMonths || subscription.planDuration || 0,
  );

  if (durationMonths >= 12) return GIF_LIMITS["12_MONTHS"];
  if (durationMonths >= 6) return GIF_LIMITS["6_MONTHS"];
  if (durationMonths >= 3) return GIF_LIMITS["3_MONTHS"];

  return GIF_LIMITS.NO_SUBSCRIPTION;
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const getRecommendedSizes = (gifLimits) => {
  // gifLimits पैरामीटर के रूप में लेता है
  if (!gifLimits) return "Standard: 300×250 px (Medium Rectangle)";

  switch (gifLimits.label) {
    case "Free (No Subscription)":
      return "Recommended: 300×250 px (Medium Rectangle)";
    case "3-Month Plan":
      return "Recommended: 728×90 px (Leaderboard), 300×250 px (Medium Rectangle)";
    case "6-Month Plan":
      return "Recommended: 728×90 px (Leaderboard), 320×50 px (Mobile Leaderboard), 300×250 px (Medium Rectangle)";
    case "12-Month Plan":
      return "All standard sizes: Leaderboard (728×90), Mobile Leaderboard (320×50), Medium Rectangle (300×250), Large Rectangle (336×280), Half Page (300×600), Square (250×250)";
    default:
      return "Standard: 300×250 px (Medium Rectangle)";
  }
};
