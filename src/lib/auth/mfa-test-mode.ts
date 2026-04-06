export function shouldExposeOtpInUi(): boolean {
  if (process.env.SHOW_MFA_CODE !== 'true') {
    return false;
  }

  // Vercel preview runs with NODE_ENV=production; allow explicitly in preview.
  if (process.env.VERCEL_ENV === 'preview') {
    return true;
  }

  if (process.env.VERCEL_ENV === 'production') {
    return false;
  }

  return process.env.NODE_ENV !== 'production';
}

