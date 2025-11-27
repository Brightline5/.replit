import { useEffect, useState } from "react";
import { useLocation } from "wouter";

export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    async function check() {
      const res = await fetch("/auth/me", {
        credentials: "include",
      });

      if (res.status === 200) {
        setChecked(true);
      } else {
        navigate("/login");
      }
    }

    check();
  }, []);

  if (!checked) return null;

  return <>{children}</>;
}
