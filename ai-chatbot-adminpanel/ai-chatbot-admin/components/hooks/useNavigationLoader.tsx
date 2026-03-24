import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
 
/**
 * Hook to show loader during route navigation
 * Returns isNavigating state and handleNavigation function
 */
export function useNavigationLoader() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
 
  // Reset navigation state when route changes
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);
 
  // Function to wrap navigation actions
  const handleNavigation = async (navigationFn: () => void | Promise<void>) => {
    setIsNavigating(true);
    try {
      await navigationFn();
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigating(false);
    }
  };
 
  return { isNavigating, handleNavigation, setIsNavigating };
}