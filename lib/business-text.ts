import type { BilingualText } from "@/lib/auth-text";

export const businessText = {
  pageTitle: { ta: "வணிக சுயவிவரம்", en: "Business profile" },
  setupIntro: {
    ta: "உங்கள் வணிக விவரங்களை உள்ளிடவும். இவற்றை பின்னர் மாற்றலாம்.",
    en: "Enter your business details. You can change them later.",
  },
  name: { ta: "வணிகப் பெயர்", en: "Business name" },
  logo: { ta: "லோகோ", en: "Logo" },
  logoHint: { ta: "PNG, JPG அல்லது WEBP, அதிகபட்சம் 2 MB", en: "PNG, JPG or WEBP, up to 2 MB" },
  address: { ta: "முகவரி", en: "Address" },
  phone: { ta: "தொலைபேசி எண்", en: "Phone number" },
  phoneHint: { ta: "எ.கா. 9876543210", en: "e.g. 9876543210" },
  gstin: { ta: "GSTIN (ஜிஎஸ்டி எண்)", en: "GSTIN" },
  gstinHint: { ta: "15 எழுத்துகள், எ.கா. 33ABCDE1234F1Z5", en: "15 characters, e.g. 33ABCDE1234F1Z5" },
  upiId: { ta: "UPI ஐடி", en: "UPI ID" },
  upiHint: { ta: "எ.கா. kadai@okaxis", en: "e.g. shopname@okaxis" },
  language: { ta: "மொழி", en: "Language" },
  tamil: { ta: "தமிழ்", en: "Tamil" },
  english: { ta: "ஆங்கிலம்", en: "English" },
  optional: { ta: "விருப்பத்தேர்வு", en: "Optional" },
  createButton: { ta: "வணிகத்தை உருவாக்கு", en: "Create business" },
  saveButton: { ta: "மாற்றங்களைச் சேமி", en: "Save changes" },
  created: { ta: "வணிக சுயவிவரம் உருவாக்கப்பட்டது.", en: "Business profile created." },
  saved: { ta: "மாற்றங்கள் சேமிக்கப்பட்டன.", en: "Changes saved." },
  backToDashboard: { ta: "முகப்புக்குத் திரும்பு", en: "Back to dashboard" },
  openBusinessProfile: { ta: "வணிக சுயவிவரம்", en: "Business profile" },
  nameRequired: { ta: "வணிகப் பெயரை உள்ளிடவும்.", en: "Enter the business name." },
  invalidPhone: {
    ta: "சரியான தொலைபேசி எண்ணை உள்ளிடவும் (10 முதல் 13 இலக்கங்கள்).",
    en: "Enter a valid phone number (10 to 13 digits).",
  },
  invalidGstin: {
    ta: "GSTIN சரியாக இல்லை. இது 33ABCDE1234F1Z5 போல 15 எழுத்துகளாக இருக்க வேண்டும்.",
    en: "GSTIN is not valid. It must be 15 characters, like 33ABCDE1234F1Z5.",
  },
  invalidUpi: {
    ta: "UPI ஐடி சரியாக இல்லை (எ.கா. kadai@okaxis).",
    en: "UPI ID is not valid (e.g. shopname@okaxis).",
  },
  logoWrongType: { ta: "லோகோ PNG, JPG அல்லது WEBP ஆக இருக்க வேண்டும்.", en: "Logo must be PNG, JPG or WEBP." },
  logoTooLarge: { ta: "லோகோ 2 MB-க்குள் இருக்க வேண்டும்.", en: "Logo must be 2 MB or smaller." },
  logoUploadFailed: {
    ta: "விவரங்கள் சேமிக்கப்பட்டன, ஆனால் லோகோ பதிவேற்றம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
    en: "Details saved, but the logo upload failed. Please try again.",
  },
  loadFailed: {
    ta: "வணிக விவரங்களை ஏற்ற முடியவில்லை. பக்கத்தைப் புதுப்பிக்கவும்.",
    en: "Could not load business details. Please refresh the page.",
  },
  saveFailed: {
    ta: "சேமிக்க முடியவில்லை. மீண்டும் முயற்சிக்கவும்.",
    en: "Could not save. Please try again.",
  },
} satisfies Record<string, BilingualText>;
