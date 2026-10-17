import { LucideIcon, Check, X, AlertTriangle } from "lucide-react";

type Status = "available" | "limited" | "unavailable";

interface AmenityBadgeProps {
  icon: LucideIcon;
  label: string;
  status: Status;
}

const statusConfig: Record<Status, { icon: typeof Check; className: string; text: string }> = {
  available:   { icon: Check,          className: "border-primary/30 bg-primary/5 text-primary",                    text: "Available" },
  limited:     { icon: AlertTriangle,  className: "border-accent/30 bg-accent/5 text-accent-foreground",            text: "Limited"   },
  unavailable: { icon: X,              className: "border-destructive/30 bg-destructive/5 text-destructive",        text: "N/A"       },
};

const AmenityBadge = ({ icon: Icon, label, status }: AmenityBadgeProps) => {
  const cfg = statusConfig[status];
  const StatusIcon = cfg.icon;

  return (
    <div className={`flex items-center gap-3 rounded-lg border p-3 ${cfg.className}`}>
      <Icon className="h-5 w-5 shrink-0" />
      <div className="flex-1 text-sm font-medium">{label}</div>
      <StatusIcon className="h-4 w-4 shrink-0" />
    </div>
  );
};

export default AmenityBadge;
