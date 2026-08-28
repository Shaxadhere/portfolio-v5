"use client";

import React, { useState } from "react";
import SuLogin from "@/components/su/SuLogin";
import SuDashboard from "@/components/su/SuDashboard";

interface SuClientWrapperProps {
  initialAuthenticated: boolean;
  initialUsername?: string;
}

export default function SuClientWrapper({
  initialAuthenticated,
  initialUsername,
}: SuClientWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuthenticated);
  const [username, setUsername] = useState<string | undefined>(initialUsername);

  const handleLoginSuccess = (user: string) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername(undefined);
  };

  if (!isAuthenticated) {
    return <SuLogin onSuccess={handleLoginSuccess} />;
  }

  return <SuDashboard username={username} onLogout={handleLogout} />;
}
