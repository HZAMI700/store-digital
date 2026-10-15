'use client';

import React from 'react';
import { OrderStatus, ORDER_STATUSES } from '@/lib/types';
import { Check, Clock, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTimelineProps {
  status: OrderStatus;
  createdAt: string;
  contactedAt?: string | null;
  className?: string;
}

interface StepItem {
  id: number;
  label: string;
  description: string;
}

const STEPS: StepItem[] = [
  {
    id: 1,
    label: 'Order Request Submitted',
    description: 'We received your order request. Waiting for admin review.',
  },
  {
    id: 2,
    label: 'Admin Contact',
    description: 'Store administrator reaches out via WhatsApp or Email.',
  },
  {
    id: 3,
    label: 'Payment Instructions',
    description: 'Payment methods explained and agreed upon directly.',
  },
  {
    id: 4,
    label: 'Payment Confirmed',
    description: 'Payment manually verified. Preparing account delivery.',
  },
  {
    id: 5,
    label: 'Completed & Delivered',
    description: 'Digital account details provided and verified.',
  },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({
  status,
  createdAt,
  contactedAt,
  className,
}) => {
  const currentConfig = ORDER_STATUSES[status] || ORDER_STATUSES.new_order;
  const currentStep = currentConfig.stepIndex;

  if (status === 'cancelled' || status === 'unable_to_contact') {
    return (
      <div className={cn('p-4 rounded-2xl border bg-rose-50 border-rose-200 shadow-subtle', className)}>
        <div className="flex items-center gap-3 text-rose-800">
          <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <div className="font-bold text-sm">
              {status === 'cancelled' ? 'Order Cancelled' : 'Unable to Establish Contact'}
            </div>
            <div className="text-xs text-rose-700 mt-0.5">
              {status === 'cancelled'
                ? 'This order request has been cancelled.'
                : 'The administrator tried contacting you but was unable to reach your number or email.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <div key={step.id} className="relative group">
              {/* Circle icon */}
              <div
                className={cn(
                  'absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all border',
                  isDone && 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
                  isCurrent && 'bg-primary-500 text-white border-primary-500 shadow-sm ring-4 ring-primary-100',
                  isPending && 'bg-surface-secondary text-content-muted border-border'
                )}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : isCurrent ? (
                  <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step info */}
              <div>
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      'text-sm font-semibold transition-colors',
                      isDone && 'text-content-primary',
                      isCurrent && 'text-primary-600 font-bold',
                      isPending && 'text-content-muted'
                    )}
                  >
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 border border-primary-200">
                      In Progress
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs mt-0.5 transition-colors leading-relaxed',
                    isCurrent ? 'text-content-secondary' : 'text-content-muted'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
