"use client"

import { motion, useInView } from "framer-motion"
import { useRef, ReactNode } from "react"

interface AnimateOnScrollProps {
  children: ReactNode
  className?: string
  animation?: "fade-in" | "fade-in-up" | "fade-in-down"
  delay?: number
  duration?: number
}

export function AnimateOnScroll({
  children,
  className = "",
  animation = "fade-in-up",
  delay = 0,
  duration = 0.7,
}: AnimateOnScrollProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const variants = {
    "fade-in": {
      hidden: { opacity: 0 },
      visible: { opacity: 1 },
    },
    "fade-in-up": {
      hidden: { opacity: 0, y: 40 },
      visible: { opacity: 1, y: 0 },
    },
    "fade-in-down": {
      hidden: { opacity: 0, y: -40 },
      visible: { opacity: 1, y: 0 },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[animation]}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
