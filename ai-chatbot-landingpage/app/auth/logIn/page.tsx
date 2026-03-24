"use client";

import LoginForm from "@/components/authPage/LoginForm";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return <LoginForm />;
}
