"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!email.includes("@")) {
          toast.error("Please enter a valid email address");
          return;
        }
        setEmail("");
        toast.success("You're subscribed! Check your inbox for offers.");
      }}
    >
      <Input
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
      />
      <Button type="submit" variant="default">
        Subscribe
      </Button>
    </form>
  );
}
