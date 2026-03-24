"use client";

import SignupForm from "@/components/authPage/SignupForm";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  return <SignupForm />;
}
