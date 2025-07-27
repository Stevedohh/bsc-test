import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";


export const useUrlParam = (key: string) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const value = searchParams.get(key);

  const setValue = useCallback((newValue: string | null) => {
    const params = new URLSearchParams(searchParams);

    if (newValue !== null && newValue !== '') {
      params.set(key, newValue);
    } else {
      params.delete(key);
    }

    const newUrl = params.toString() ? `?${params.toString()}` : '/';
    router.replace(newUrl, { scroll: false });
  }, [key, router, searchParams]);

  return {
    value,
    setValue
  };
};
