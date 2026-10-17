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
    label: 'تم استلام طلب الشراء',
    description: 'تم تسجيل طلبك في نظام المتجر وبانتظار مراجعة الإدارة.',
  },
  {
    id: 2,
    label: 'تواصل مسؤول المتجر',
    description: 'يتواصل معك المشرف عبر الواتساب أو البريد الإلكتروني.',
  },
  {
    id: 3,
    label: 'إرسال بيانات الدفع',
    description: 'توضيح طرق الدفع المتاحة والاتفاق على طريقة السداد.',
  },
  {
    id: 4,
    label: 'تأكيد استلام الدفع',
    description: 'التحقق اليدوي من سداد القيمة وتجهيز بيانات الحساب.',
  },
  {
    id: 5,
    label: 'اكتمال الطلب والتسليم',
    description: 'تسليم بيانات الحساب الرقمي وتفعيل الضمان الكامل.',
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
      <div className={cn('p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-800 shadow-sm', className)}>
        <div className="flex items-center gap-3">
          <XCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <div>
            <div className="font-bold text-sm">
              {status === 'cancelled' ? 'تم إلغاء الطلب' : 'تعذر التواصل مع العميل'}
            </div>
            <div className="text-xs text-rose-700 mt-0.5">
              {status === 'cancelled'
                ? 'تم إلغاء هذا الطلب من قبل الإدارة أو العميل.'
                : 'حاول المشرف التواصل معك لكن لم يتلق رداً عبر الواتساب أو البريد.'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative pr-6 sm:pr-8 space-y-6 before:absolute before:right-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          const isPending = currentStep < step.id;

          return (
            <div key={step.id} className="relative group">
              {/* Circle icon */}
              <div
                className={cn(
                  'absolute -right-6 sm:-right-8 top-0.5 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all border',
                  isDone && 'bg-emerald-600 text-white border-emerald-600 shadow-sm',
                  isCurrent && 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-4 ring-indigo-500/20',
                  isPending && 'bg-slate-100 text-slate-400 border-slate-300'
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
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <h4
                    className={cn(
                      'text-xs sm:text-sm font-semibold transition-colors',
                      isDone && 'text-slate-800',
                      isCurrent && 'text-indigo-600 font-bold',
                      isPending && 'text-slate-400'
                    )}
                  >
                    {step.label}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      قيد المعالجة
                    </span>
                  )}
                </div>
                <p
                  className={cn(
                    'text-xs mt-0.5 transition-colors leading-relaxed',
                    isCurrent ? 'text-slate-600' : 'text-slate-400'
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
