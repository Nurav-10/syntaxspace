"use client";

import * as React from "react";
import { motion } from "motion/react";
import Image from "next/image";

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md transition-colors duration-300">
      <div className="relative flex flex-col items-center justify-center space-y-6 select-none">
        {/* Loading Spinner */}
        <div className="relative h-20 w-20 flex items-center justify-center">
          {/* Outer glowing ring */}
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-foreground border-r-foreground/30"
            animate={{ rotate: 360 }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 1,
            }}
          />

          {/* Inner ring spinning backwards */}
          <motion.div
            className="absolute h-14 w-14 rounded-full border border-transparent border-b-foreground/80 border-l-foreground/20"
            animate={{ rotate: -360 }}
            transition={{
              repeat: Infinity,
              ease: "linear",
              duration: 1.5,
            }}
          />

          {/* Logo dot in the center */}
          <Image
            src="/ss-logo-light.svg"
            alt="Logo"
            width={100}
            height={100}
            className="hidden dark:block w-8 h-8 object-contain"
          />
          <Image
            src="/ss-logo.svg"
            alt="Logo"
            width={100}
            height={100}
            className="block dark:hidden w-8 h-8 object-contain"
          />
        </div>

        {/* Text */}
        <div className="flex flex-col items-center space-y-1">
          <motion.span
            className="font-mono text-sm font-bold tracking-[0.3em] uppercase text-foreground"
            animate={{
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              repeat: Infinity,
              ease: "easeInOut",
              duration: 2,
            }}
          >
            SYNTAX
            <span className="font-sans font-light text-muted-foreground">
              SPACE
            </span>
          </motion.span>

          <motion.span
            className="font-mono text-xs uppercase tracking-widest text-muted-foreground/80 animate-pulse"
            animate={{
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              repeat: Infinity,
              ease: "easeInOut",
              duration: 2,
              delay: 0.3,
            }}
          >
            Loading...
          </motion.span>
        </div>
      </div>
    </div>
  );
}
