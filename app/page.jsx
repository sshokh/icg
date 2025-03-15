"use client";

import { button as buttonStyles } from "@heroui/theme";
import Link from "next/link";

import { title, subtitle } from "../misc/primitives";
import { useEffect } from "react";

import { Button } from "@heroui/react";
import React from "react";

export default function Home() {
  let isAuthenticated = false;

  useEffect(() => {
    isAuthenticated = !!localStorage.getItem("token");
  }, []);

  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-xl text-5xl text-center justify-center">
        <span className={title({ color: "blue" })}>
          Intelligent Career Guidance
        </span>
        <div className={subtitle({ class: "mt-4" })}>
          <span>
            AI-powered platform that helps students identify potential career
            paths based on their skills, interests, and preferences.
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-min">
        <Link
          className="w-full"
          href={isAuthenticated ? "/questions" : "/auth"}
        >
          <Button
            className={`${buttonStyles({
              color: "primary",
              radius: "full",
              variant: "shadow",
            })} w-full`}
          >
            Let&apos;s Begin
          </Button>
        </Link>
      </div>
    </section>
  );
}
