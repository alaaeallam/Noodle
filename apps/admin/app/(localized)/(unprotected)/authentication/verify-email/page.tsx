import { redirect } from 'next/navigation';

// Unfinished template stub (no backend wiring) — send visitors to the real login.
export default function VerifyEmailPage() {
  redirect('/authentication/login');
}
