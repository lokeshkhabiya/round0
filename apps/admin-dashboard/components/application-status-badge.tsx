"use client"

import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, Eye, AlertCircle } from "lucide-react"

interface ApplicationStatusBadgeProps {
  status: string | undefined
}

export function ApplicationStatusBadge({ status }: ApplicationStatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "pending":
        return {
          color: "bg-muted/70 text-foreground border-border/70",
          icon: <Clock className="h-3 w-3" />,
          label: "Pending",
        }
      case "invited":
        return {
          color: "bg-secondary/85 text-secondary-foreground border-border/70",
          icon: <AlertCircle className="h-3 w-3" />,
          label: "Invited",
        }
      case "in_progress":
        return {
          color: "bg-primary/15 text-foreground border-primary/35",
          icon: <Eye className="h-3 w-3" />,
          label: "In Progress",
        }
      case "completed":
        return {
          color: "bg-accent/20 text-accent-foreground border-accent/35",
          icon: <CheckCircle className="h-3 w-3" />,
          label: "Completed",
        }
      case "accepted":
        return {
          color: "bg-primary text-primary-foreground border-primary/60",
          icon: <CheckCircle className="h-3 w-3" />,
          label: "Accepted",
        }
      case "rejected":
        return {
          color: "bg-destructive/20 text-destructive border-destructive/35",
          icon: <XCircle className="h-3 w-3" />,
          label: "Rejected",
        }
      default:
        return {
          color: "bg-card/70 text-muted-foreground border-border/70",
          icon: <Clock className="h-3 w-3" />,
          label: status ? status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ") : "Unknown Status",
        }
    }
  }

  const config = getStatusConfig(status || "")

  return (
    <Badge className={`${config.color} flex items-center gap-1 text-xs px-2 py-1`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}
