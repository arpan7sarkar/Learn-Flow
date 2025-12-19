import { useUser } from '@clerk/clerk-react';

/**
 * Hook to get current user email for API calls
 */
export function useUserEmail(): string | null {
  const { user, isLoaded } = useUser();
  
  if (!isLoaded || !user) return null;
  
  return user.primaryEmailAddress?.emailAddress || null;
}

/**
 * Get user email synchronously (for use outside React components)
 * This requires the email to be passed manually from components
 */
export function getUserEmailFromClerk(user: any): string | null {
  if (!user) return null;
  return user.primaryEmailAddress?.emailAddress || null;
}
