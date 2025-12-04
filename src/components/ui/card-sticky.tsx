"use client"

import * as React from "react"
import { HTMLMotionProps, motion } from "motion/react"
import { cn } from "./utils"

interface CardStickyProps extends HTMLMotionProps<"div"> {
  index: number
  incrementY?: number
  incrementZ?: number
  offsetTop?: number | string
}

const ContainerScroll = React.forwardRef<
  HTMLDivElement,
  React.HTMLProps<HTMLDivElement>
>(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative w-full bg-black flex items-center justify-center", className)}
      style={{ perspective: "1000px", ...props.style }}
      {...props}
    >
      <div className="w-full max-w-4xl mx-auto">
        {children}
      </div>
    </div>
  )
})
ContainerScroll.displayName = "ContainerScroll"

const CardSticky = React.forwardRef<HTMLDivElement, CardStickyProps>(
  (
    {
      index,
      incrementY = 10,
      incrementZ = 10,
      offsetTop = 0,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const y = index * incrementY
    const z = index * incrementZ
    const topValue = typeof offsetTop === 'number'
      ? y + offsetTop
      : `calc(${offsetTop} + ${y}px)`

    return (
      <motion.div
        ref={ref}
        layout="position"
        style={{
          top: topValue,
          z,
          backfaceVisibility: "hidden",
          ...style,
        }}
        className={cn("sticky", className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
CardSticky.displayName = "CardSticky"

export { ContainerScroll, CardSticky }
