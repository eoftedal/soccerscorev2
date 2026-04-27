import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { DataUrl, Logo, LogoId } from "@/models/types";
import { idbGetAll, idbPut, idbDelete, idbGetMeta, idbSetMeta } from "./db";

const generateUUID = (): string => crypto.randomUUID();

export const useLogoStore = defineStore("logos", () => {
  const logos = ref<Record<LogoId, Logo>>({});

  async function init() {
    const migrated = await idbGetMeta("logos-localStorage-migrated");
    if (migrated !== "true") {
      const stored = localStorage.getItem("logos");
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as Record<LogoId, Logo>;
          for (const logo of Object.values(parsed)) {
            await idbPut("logos", logo);
          }
        } catch (e) {
          console.error("Failed to migrate logos from localStorage to IndexedDB", e);
        }
      }
      await idbSetMeta("logos-localStorage-migrated", "true");
    }

    const allLogos = await idbGetAll<Logo>("logos");
    logos.value = Object.fromEntries(allLogos.map((l) => [l.id, l])) as Record<LogoId, Logo>;
  }

  const initialized = init();

  const addLogo = (name: string, dataUrl: DataUrl): LogoId => {
    const id = generateUUID() as LogoId;
    const logo: Logo = { id, name, dataUrl, uploadedAt: Date.now() };
    logos.value[id] = logo;
    idbPut("logos", logo);
    return id;
  };

  const importLogo = (logo: Logo): void => {
    logos.value[logo.id] = logo;
    idbPut("logos", logo);
  };

  const removeLogo = (id: LogoId): void => {
    delete logos.value[id];
    idbDelete("logos", id);
  };

  const getLogo = (id: LogoId | undefined): Logo | undefined => {
    if (!id) return undefined;
    return logos.value[id];
  };

  const getLogoUrl = (id: LogoId | undefined): string | undefined => getLogo(id)?.dataUrl;

  const searchLogos = computed(() => {
    return (query: string): Logo[] => {
      const lowerQuery = query.toLowerCase();
      return Object.values(logos.value)
        .filter((logo) => logo.name.toLowerCase().includes(lowerQuery))
        .sort((a, b) => b.uploadedAt - a.uploadedAt);
    };
  });

  const allLogos = computed((): Logo[] => {
    return Object.values(logos.value).sort((a, b) => b.uploadedAt - a.uploadedAt);
  });

  const findLogoByDataUrl = (dataUrl: string): LogoId | undefined => {
    const logo = Object.values(logos.value).find((l) => l.dataUrl === dataUrl);
    return logo?.id;
  };

  return {
    logos,
    initialized,
    addLogo,
    removeLogo,
    getLogo,
    getLogoUrl,
    searchLogos,
    allLogos,
    findLogoByDataUrl,
    importLogo,
  };
});
