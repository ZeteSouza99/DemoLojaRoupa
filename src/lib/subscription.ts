/**
 * Mensalidade do sistema.
 *
 * Configuração de uma única cobrança recorrente (a licença do próprio sistema),
 * paga via Pix para o beneficiário configurado no ambiente. A cobrança fica
 * desativada quando não há chave Pix, como no ambiente de demonstração.
 * O valor e o beneficiário são definidos por deploy; o identificador muda por competência.
 *
 * Sem dependências de servidor: também é usado em client components.
 */

import { buildRecurringTxid } from "./pix";

const subscriptionPixKey = process.env.NEXT_PUBLIC_SUBSCRIPTION_PIX_KEY?.trim() ?? "";

export const SYSTEM_SUBSCRIPTION_ENABLED = subscriptionPixKey.length > 0;

export const SYSTEM_SUBSCRIPTION = {
  /** Categoria usada como prefixo do txid no extrato bancário. */
  category: "SISTEMA",
  description: "Mensalidade do sistema",
  amount: Number(process.env.NEXT_PUBLIC_SUBSCRIPTION_AMOUNT ?? 100),
  /** Dia do mês em que a mensalidade vence. */
  dueDay: Number(process.env.NEXT_PUBLIC_SUBSCRIPTION_DUE_DAY ?? 20),
  pixKey: subscriptionPixKey,
  beneficiaryName:
    process.env.NEXT_PUBLIC_SUBSCRIPTION_PIX_NAME ?? "",
  beneficiaryCity:
    process.env.NEXT_PUBLIC_SUBSCRIPTION_PIX_CITY ?? "",
  /** Dias antes do vencimento em que a notificação começa a aparecer. */
  notifyDaysBefore: Number(
    process.env.NEXT_PUBLIC_SUBSCRIPTION_NOTIFY_DAYS ?? 5,
  ),
  /** Dias após o vencimento em que a cobrança ainda aponta para o mês atual. */
  graceDays: 10,
} as const;

export interface SubscriptionCycle {
  /** Vencimento da competência em aberto. */
  dueDate: Date;
  /** Identificador que chega no extrato (ex.: SISTEMA202608). */
  txid: string;
  /** Negativo quando já venceu. */
  daysUntilDue: number;
  isOverdue: boolean;
  /** Se a notificação deve aparecer no sino. */
  shouldNotify: boolean;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Resolve a competência em aberto a partir de uma data de referência.
 *
 * Após o período de tolerância a cobrança pula para o mês seguinte, para não
 * ficar exibindo eternamente um vencimento que já passou.
 */
export function getSubscriptionCycle(reference: Date = new Date()): SubscriptionCycle {
  const today = startOfDay(reference);
  const { dueDay, graceDays, notifyDaysBefore } = SYSTEM_SUBSCRIPTION;

  let dueDate = new Date(today.getFullYear(), today.getMonth(), dueDay);
  const daysSinceDue = Math.round(
    (today.getTime() - dueDate.getTime()) / 86_400_000,
  );
  if (daysSinceDue > graceDays) {
    dueDate = new Date(today.getFullYear(), today.getMonth() + 1, dueDay);
  }

  const daysUntilDue = Math.round(
    (dueDate.getTime() - today.getTime()) / 86_400_000,
  );

  return {
    dueDate,
    txid: buildRecurringTxid(SYSTEM_SUBSCRIPTION.category, dueDate),
    daysUntilDue,
    isOverdue: daysUntilDue < 0,
    shouldNotify: daysUntilDue <= notifyDaysBefore,
  };
}

/** Texto curto do vencimento, para a notificação. */
export function describeDue(cycle: SubscriptionCycle): string {
  if (cycle.daysUntilDue < 0) {
    const days = Math.abs(cycle.daysUntilDue);
    return days === 1 ? "Venceu ontem" : `Venceu há ${days} dias`;
  }
  if (cycle.daysUntilDue === 0) return "Vence hoje";
  if (cycle.daysUntilDue === 1) return "Vence amanhã";
  return `Vence em ${cycle.daysUntilDue} dias`;
}
