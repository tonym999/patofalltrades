export const OPEN_MOBILE_MENU = "open-mobile-menu" as const;
export const MOBILE_MENU_STATE = "mobile-menu-state" as const;

export type OpenMobileMenuDetail = {
  trigger?: HTMLElement;
  source?: "header" | "tabs_nav";
};


