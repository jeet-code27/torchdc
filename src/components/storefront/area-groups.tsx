"use client";

import * as React from "react";
import { LOCATION_GROUPS, type LocationLink, type LocationState } from "@/lib/location-groups";

/** A neighborhood page made on Admin › Pages, added to the lists of its state */
export type ExtraArea = LocationLink & { state: LocationState };

const ExtraAreasContext = React.createContext<ExtraArea[]>([]);

export function AreaGroupsProvider({ extra, children }: { extra: ExtraArea[]; children: React.ReactNode }) {
  return <ExtraAreasContext.Provider value={extra}>{children}</ExtraAreasContext.Provider>;
}

/** Neighborhood lists by state: the client's pages, then the ones made on Admin › Pages */
export function useAreaGroups(): Record<LocationState, LocationLink[]> {
  const extra = React.useContext(ExtraAreasContext);
  return React.useMemo(() => {
    if (!extra.length) return LOCATION_GROUPS;
    const out = { DC: [...LOCATION_GROUPS.DC], MD: [...LOCATION_GROUPS.MD], VA: [...LOCATION_GROUPS.VA] };
    for (const a of extra) {
      if (out[a.state] && !out[a.state].some((x) => x.slug === a.slug)) out[a.state].push({ slug: a.slug, name: a.name });
    }
    return out;
  }, [extra]);
}

export function useExtraAreaSlugs(): string[] {
  const extra = React.useContext(ExtraAreasContext);
  return React.useMemo(() => extra.map((a) => a.slug), [extra]);
}
