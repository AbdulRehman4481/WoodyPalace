"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Package, ShoppingCart, Users, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"

const iconMap = {
  package: Package,
  cart: ShoppingCart,
  users: Users,
  dollar: DollarSign,
}

interface StatCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  iconName: keyof typeof iconMap
  iconColor?: string
}

export function StatCard({ title, value, change, changeType = "neutral", iconName, iconColor = "bg-blue-500" }: StatCardProps) {
  const Icon = iconMap[iconName]

  return (
    <Card className="relative overflow-hidden border-2 border-purple-200/50 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-600 uppercase tracking-wide">{title}</p>
            <p className="text-4xl font-extrabold mt-3 gradient-text">{value}</p>
            {change && (
              <p
                className={cn(
                  "text-sm mt-3 font-medium",
                  changeType === "positive" && "text-green-600",
                  changeType === "negative" && "text-red-600",
                  changeType === "neutral" && "text-gray-600"
                )}
              >
                {change}
              </p>
            )}
          </div>
          <div className={cn("p-4 rounded-2xl shadow-xl", iconColor)}>
            <Icon className="h-8 w-8 text-white drop-shadow-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
