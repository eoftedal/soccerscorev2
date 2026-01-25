import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { DataUrl, Logo, LogoId } from "@/models/types";

// Generate UUID v4
const generateUUID = (): string => {
  return crypto.randomUUID();
};

export const useLogoStore = defineStore("logos", () => {
  const logos = ref<Record<LogoId, Logo>>({});

  // Load from localStorage
  const loadLogos = () => {
    const stored = localStorage.getItem("logos");
    if (stored) {
      try {
        logos.value = JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse logos from localStorage", e);
      }
    }
  };

  // Save to localStorage
  const saveLogos = () => {
    localStorage.setItem("logos", JSON.stringify(logos.value));
  };

  // Add a new logo
  const addLogo = (name: string, dataUrl: DataUrl): LogoId => {
    const id = generateUUID() as LogoId;
    const logo: Logo = {
      id,
      name,
      dataUrl,
      uploadedAt: Date.now(),
    };
    logos.value[id] = logo;
    saveLogos();
    return id;
  };

  // Remove a logo
  const removeLogo = (id: LogoId): void => {
    delete logos.value[id];
    saveLogos();
  };

  // Get a logo by ID
  const getLogo = (id: LogoId | undefined): Logo | undefined => {
    if (!id) return undefined;
    return logos.value[id];
  };

  // Get logo data URL by ID
  const getLogoUrl = (id: LogoId | undefined): string | undefined => {
    return getLogo(id)?.dataUrl;
  };

  // Search logos by name
  const searchLogos = computed(() => {
    return (query: string): Logo[] => {
      const lowerQuery = query.toLowerCase();
      return Object.values(logos.value)
        .filter((logo) => logo.name.toLowerCase().includes(lowerQuery))
        .sort((a, b) => b.uploadedAt - a.uploadedAt);
    };
  });

  // Get all logos sorted by upload date
  const allLogos = computed((): Logo[] => {
    return Object.values(logos.value).sort((a, b) => b.uploadedAt - a.uploadedAt);
  });

  // Find logo by exact data URL (for migration)
  const findLogoByDataUrl = (dataUrl: string): LogoId | undefined => {
    const logo = Object.values(logos.value).find((l) => l.dataUrl === dataUrl);
    return logo?.id;
  };

  // Initialize on store creation
  loadLogos();

  return {
    logos,
    addLogo,
    removeLogo,
    getLogo,
    getLogoUrl,
    searchLogos,
    allLogos,
    findLogoByDataUrl,
    loadLogos,
  };
});
