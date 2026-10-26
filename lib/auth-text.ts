import type { AuthError } from "@supabase/supabase-js";

/** A piece of UI text in Tamil and English. */
export type BilingualText = { ta: string; en: string };

export const authText = {
  appName: { ta: "இன்னோவெக்ஸா ERP", en: "Innovexa ERP" },
  loginTitle: { ta: "உள்நுழைக", en: "Log in" },
  signupTitle: { ta: "பதிவு செய்க", en: "Sign up" },
  email: { ta: "மின்னஞ்சல்", en: "Email" },
  password: { ta: "கடவுச்சொல்", en: "Password" },
  confirmPassword: { ta: "கடவுச்சொல்லை உறுதிப்படுத்துக", en: "Confirm password" },
  passwordHint: { ta: "குறைந்தது 6 எழுத்துகள்", en: "At least 6 characters" },
  loginButton: { ta: "உள்நுழைக", en: "Log in" },
  signupButton: { ta: "கணக்கை உருவாக்கு", en: "Create account" },
  logoutButton: { ta: "வெளியேறு", en: "Log out" },
  pleaseWait: { ta: "காத்திருக்கவும்…", en: "Please wait…" },
  loading: { ta: "ஏற்றுகிறது…", en: "Loading…" },
  noAccount: { ta: "கணக்கு இல்லையா?", en: "Don't have an account?" },
  haveAccount: { ta: "ஏற்கனவே கணக்கு உள்ளதா?", en: "Already have an account?" },
  loggedInAs: { ta: "உள்நுழைந்துள்ளவர்", en: "Logged in as" },
  checkEmail: {
    ta: "கணக்கு உருவாக்கப்பட்டது. உங்கள் மின்னஞ்சலில் உள்ள இணைப்பைக் கிளிக் செய்து உறுதிப்படுத்தவும், பிறகு உள்நுழையவும்.",
    en: "Account created. Click the link in your email to confirm it, then log in.",
  },
  passwordsDontMatch: { ta: "கடவுச்சொற்கள் பொருந்தவில்லை.", en: "Passwords do not match." },
  passwordTooShort: {
    ta: "கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.",
    en: "Password must be at least 6 characters.",
  },
} satisfies Record<string, BilingualText>;

export const MIN_PASSWORD_LENGTH = 6;

const errorText: Record<string, BilingualText> = {
  invalid_credentials: {
    ta: "மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.",
    en: "Incorrect email or password.",
  },
  email_not_confirmed: {
    ta: "மின்னஞ்சல் இன்னும் உறுதிப்படுத்தப்படவில்லை. உங்கள் மின்னஞ்சலில் உள்ள இணைப்பைக் கிளிக் செய்யவும்.",
    en: "Email not confirmed yet. Click the link in your email first.",
  },
  user_already_exists: {
    ta: "இந்த மின்னஞ்சலுக்கு ஏற்கனவே கணக்கு உள்ளது. உள்நுழையவும்.",
    en: "An account with this email already exists. Please log in.",
  },
  weak_password: {
    ta: "கடவுச்சொல் மிகவும் பலவீனமாக உள்ளது. நீளமான கடவுச்சொல்லைப் பயன்படுத்தவும்.",
    en: "Password is too weak. Use a longer password.",
  },
  email_address_invalid: { ta: "சரியான மின்னஞ்சலை உள்ளிடவும்.", en: "Enter a valid email address." },
  over_request_rate_limit: {
    ta: "பல முயற்சிகள். சிறிது நேரம் கழித்து முயற்சிக்கவும்.",
    en: "Too many attempts. Please try again in a few minutes.",
  },
  over_email_send_rate_limit: {
    ta: "பல மின்னஞ்சல்கள் அனுப்பப்பட்டன. சிறிது நேரம் கழித்து முயற்சிக்கவும்.",
    en: "Too many emails sent. Please try again later.",
  },
  signup_disabled: { ta: "புதிய பதிவு தற்போது முடக்கப்பட்டுள்ளது.", en: "New sign-ups are currently disabled." },
};

const genericError: BilingualText = {
  ta: "ஏதோ தவறு நடந்துவிட்டது. மீண்டும் முயற்சிக்கவும்.",
  en: "Something went wrong. Please try again.",
};

/** Turns a Supabase Auth error into a Tamil + English message. */
export function authErrorText(error: AuthError | Error | null | undefined): BilingualText {
  const code = error && "code" in error ? error.code : undefined;
  return (code && errorText[code]) || genericError;
}

export const accountExistsText = errorText.user_already_exists;
