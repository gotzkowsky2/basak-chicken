"use client";
import { useEffect } from "react";

export default function EmployeeEntry() {
  useEffect(() => {
    if (typeof document !== "undefined") {
      const hasEmployee = document.cookie.includes("employee_auth=");
      if (!hasEmployee) {
        window.location.replace("/employee/login");
      }
    }
  }, []);

  return null;
} 