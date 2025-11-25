"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth/auth-provider";

export const useRequireNoActiveReport = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/wolontariusz/login");
      return;
    }

    if (user?.active_report) {
      router.replace("/wolontariusz/panel");
      return;
    }

    setIsChecking(false);
  }, [authLoading, isAuthenticated, user, router]);

  return { isAuthenticated, isLoading: authLoading || isChecking };
};
