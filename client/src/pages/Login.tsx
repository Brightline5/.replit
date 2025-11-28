import { useUser, SignIn } from "@stackframe/react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const user = useUser();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100 py-8 overflow-y-auto" data-testid="page-login">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-6 text-center text-gray-900">ShiftSage Login</h1>
        <SignIn />
      </div>
    </div>
  );
}
