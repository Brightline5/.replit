import { useUser } from "@stackframe/react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function RequireLogin({ children }: { children: React.ReactNode }) {
  const [, navigate] = useLocation();
  const user = useUser();

  useEffect(() => {
    if (user === null) {
      navigate("/login");
    }
  }, [user, navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
}
