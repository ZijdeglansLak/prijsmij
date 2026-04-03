import { useEffect, useState } from "react";

export interface CategoryGroup {
  id: number;
  name: string;
  slug: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

export function useCategoryGroups() {
  const [groups, setGroups] = useState<CategoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/category-groups")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setGroups(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { groups, loading };
}
