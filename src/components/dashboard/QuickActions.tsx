"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Users, ShoppingCart, FolderTree } from "lucide-react"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    {
      title: "New Product",
      description: "Add a product to your catalog",
      icon: Package,
      action: () => router.push("/products/new"),
    },
    {
      title: "New Customer",
      description: "Create a new customer account",
      icon: Users,
      action: () => router.push("/customers/new"),
    },
    {
      title: "View Orders",
      description: "Manage customer orders",
      icon: ShoppingCart,
      action: () => router.push("/orders"),
    },
    {
      title: "New Category",
      description: "Organize your products",
      icon: FolderTree,
      action: () => router.push("/categories/new"),
    },
  ]

  return (
    <Card className="card-neo">
      <CardHeader>
        <CardTitle className="text-pretty">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant="outline"
              className="h-auto p-4 justify-start card-neo bg-transparent"
              onClick={action.action}
            >
              <div className="flex items-start gap-3 w-full">
                <div className="p-2 rounded-lg icon-neo" aria-hidden="true">
                  <action.icon className="h-5 w-5 text-[oklch(0.985_0_0)]" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">{action.title}</p>
                  <p className="text-sm text-muted-foreground">{action.description}</p>
                </div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
