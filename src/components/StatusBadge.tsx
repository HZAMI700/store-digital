import React from 'react';
import { OrderStatus, ORDER_STATUSES } from '@/lib/types';
import {
  Sparkles,
  PhoneCall,
  Clock,
  CreditCard,
  CheckCircle2,
  PackageCheck,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: OrderStatus;
  className?: string;
  showIcon?: boolean;
}

const STATUS_ICONS: Record<OrderStatus, React.ElementType> = {
  new_order: Sparkles,
  contacting_customer: PhoneCall,
  awaiting_customer_response: Clock,
  payment_instructions_sent: CreditCard,
  payment_confirmed: CheckCircle2,
  completed: PackageCheck,
  cancelled: XCircle,
  unable_to_contact: AlertTriangle,
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  const config = ORDER_STATUSES[status] || ORDER_STATUSES.new_order;
  const Icon = STATUS_ICONS[status] || Sparkles;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all duration-200',
        config.badgeBg,
        config.badgeBorder,
        config.badgeText,
        className
      )}
      title={config.description}
    >
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0 animate-pulse" />}
      <span>{config.label}</span>
    </span>
  );
};
