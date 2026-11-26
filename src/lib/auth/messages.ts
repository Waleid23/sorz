/** Minimum password length, checked before calling Supabase (which requires at least 6). */
export const MIN_PASSWORD_LENGTH = 8;

export type AuthFormState = {
  error?: string;
  message?: string;
  email?: string;
};

/** Checks the form fields; returns an error message, or null if they look fine. */
export function validateCredentials(
  email: string,
  password: string,
): string | null {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return "Enter a valid email address.";
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  return null;
}

/** Turns a Supabase Auth error into a short message for the form. */
export function authErrorMessage(error: {
  code?: string;
  message?: string;
}): string {
  switch (error.code) {
    case "invalid_credentials":
      return "Wrong email or password.";
    case "email_not_confirmed":
      return "Confirm your email first. Check your inbox for the link.";
    case "user_already_exists":
    case "email_exists":
      return "An account with this email already exists. Log in instead.";
    case "weak_password":
      return "That password is too weak. Try a longer one.";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "Too many attempts. Wait a few minutes and try again.";
    case "email_address_invalid":
      return "Enter a valid email address.";
    default:
      return "Something went wrong. Please try again.";
  }
}
