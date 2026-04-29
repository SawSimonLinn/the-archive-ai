import { supabaseAdmin } from './supabase-admin';
import { getEffectivePlanId } from './billing';
import { PLANS, type PlanId } from './plans';

export async function getUserPlan(userId: string): Promise<typeof PLANS[PlanId]> {
  const { data } = await supabaseAdmin
    .from('user_subscriptions')
    .select('plan_id, status')
    .eq('user_id', userId)
    .maybeSingle();

  const planId = getEffectivePlanId(data?.plan_id, data?.status) as PlanId;
  return PLANS[planId] ?? PLANS.free;
}
