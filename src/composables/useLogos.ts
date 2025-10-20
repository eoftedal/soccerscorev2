import { useLogoStore } from '@/stores/logos';
import { useMatchStore } from '@/stores/matches';
import { storeToRefs } from 'pinia';

/**
 * Composable for logo-related utilities
 */
export function useLogos() {
  const logoStore = useLogoStore();
  const { teams } = storeToRefs(useMatchStore());
  const { logos } = storeToRefs(logoStore);

  /**
   * Resolves a logo reference to its data URL.
   * Handles both direct logo IDs and team references (team:id format).
   * 
   * @param logoRef - Logo ID or team reference string
   * @returns The logo data URL, or undefined if not found
   */
  function getLogoUrl(logoRef: string | undefined): string | undefined {
    if (!logoRef) return undefined;
    
    // Handle team reference format: "team:teamId"
    if (logoRef.startsWith('team:')) {
      const teamId = logoRef.substring(5);
      const teamLogo = teams.value[teamId as any]?.logo;
      if (teamLogo) {
        return logos.value[teamLogo as any]?.dataUrl;
      }
      return undefined;
    }
    
    // Direct logo ID reference
    return logos.value[logoRef as any]?.dataUrl;
  }

  return {
    getLogoUrl,
  };
}
