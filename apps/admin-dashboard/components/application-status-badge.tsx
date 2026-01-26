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
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: <Clock className="h-3 w-3" />,
          label: "Pending",
        }
      case "invited":
        return {
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: <AlertCircle className="h-3 w-3" />,
          label: "Invited",
        }
      case "in_progress":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: <Eye className="h-3 w-3" />,
          label: "In Progress",
        }
      case "completed":
        return {
          color: "bg-indigo-100 text-indigo-800 border-indigo-200",
          icon: <CheckCircle className="h-3 w-3" />,
          label: "Completed",
        }
      case "accepted":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: <CheckCircle className="h-3 w-3" />,
          label: "Accepted",
        }
      case "rejected":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: <XCircle className="h-3 w-3" />,
          label: "Rejected",
        }
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
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
