import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

/**
 * Basic shadcn-style Tabs – only the parts our UI needs.
 */

export const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ className, ...props }, ref) => <TabsPrimitive.Root ref={ref} className={cn("w-full", className)} {...props} />)
Tabs.displayName = "Tabs"

export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn("inline-flex w-full items-center justify-center rounded-lg bg-slate-800/50 p-1", className)}
    {...props}
  />
))
TabsList.displayName = "TabsList"

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex-1 select-none rounded-md py-2 text-sm font-medium ring-offset-background " +
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring " +
        "focus-visible:ring-offset-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black",
      className,
    )}
    {...props}
  />
))
TabsTrigger.displayName = "TabsTrigger"

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn("mt-4 focus-visible:outline-none", className)} {...props} />
))
TabsContent.displayName = "TabsContent"
