import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import React, { createContext, useCallback, useContext, useState } from "react";

interface SubscriptionsContextValue {
  subscriptions: Subscription[];
  addSubscription: (s: Subscription) => void;
}

const SubscriptionsContext = createContext<SubscriptionsContextValue | null>(null);

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = useCallback((s: Subscription) => {
    setSubscriptions((prev) => [s, ...prev]);
  }, []);

  return (
    <SubscriptionsContext.Provider value={{ subscriptions, addSubscription }}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export function useSubscriptions(): SubscriptionsContextValue {
  const ctx = useContext(SubscriptionsContext);
  if (!ctx) throw new Error("useSubscriptions must be used within SubscriptionsProvider");
  return ctx;
}
