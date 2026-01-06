import { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { sanityClient } from '../lib/sanity';

export function useSyncUser() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function syncUserToSanity() {
      if (!isLoaded || !user) return;

      try {
        // Check if user exists in Sanity
        const existingUser = await sanityClient.fetch(
          `*[_type == "user" && clerkId == $clerkId][0]`,
          { clerkId: user.id }
        );

        if (!existingUser) {
          // Create user in Sanity
          await sanityClient.create({
            _type: 'user',
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || '',
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            imageUrl: user.imageUrl,
            createdAt: new Date().toISOString(),
          });
          console.log('User synced to Sanity');
        }
      } catch (error) {
        console.error('Error syncing user to Sanity:', error);
      }
    }

    syncUserToSanity();
  }, [user, isLoaded]);

  return { user, isLoaded };
}
