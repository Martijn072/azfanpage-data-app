import { useCanonical } from '@/hooks/useCanonical';

/**
 * Component that handles dynamic canonical URL injection.
 * Place inside BrowserRouter to ensure canonical tags point to azfanpage.nl
 */
export const CanonicalTag = () => {
  useCanonical();
  return null;
};
