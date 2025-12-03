'use client';

import { useEffect, useRef } from 'react';
import { pusherClient } from '@/lib/pusher-client';

export const usePusher = (username?: string) => {
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (username) {
      // Subscribe to the portfolio channel
      channelRef.current = pusherClient.subscribe(`portfolio-${username}`);

      // Bind to portfolio-updated event
      channelRef.current.bind('portfolio-updated', (data: any) => {
        console.log('📡 Portfolio updated via Pusher:', data);
        // Handle portfolio update - could trigger a refetch or state update
        window.dispatchEvent(new CustomEvent('portfolioUpdated', { detail: data }));
      });

      // Cleanup on unmount or username change
      return () => {
        if (channelRef.current) {
          channelRef.current.unbind_all();
          pusherClient.unsubscribe(`portfolio-${username}`);
        }
      };
    }
  }, [username]);

  return { channel: channelRef.current };
};