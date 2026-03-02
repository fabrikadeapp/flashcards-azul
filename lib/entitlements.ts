import { supabaseAdmin as supabase } from '@/lib/supabaseAdmin';
import { Entitlement } from './types/commerce';

/**
 * Enterprise-grade entitlement logic.
 * This is the ONLY place where entitlements should be granted or extended.
 */
export async function grantOrExtendEntitlement(
    userId: string,
    productId: string,
    accessDays: number,
    metadata: any = {}
): Promise<Entitlement | null> {
    console.log(`Granting/extending entitlement for user ${userId}, product ${productId}, days ${accessDays}`);

    try {
        // Use the DB function designed for this to ensure consistency and transactionality
        const { data, error } = await supabase.rpc('extend_entitlement', {
            p_user_id: userId,
            p_product_id: productId,
            p_access_days: accessDays
        });

        if (error) {
            console.error('Error calling extend_entitlement RPC:', error);
            // Fallback: Manual implementation if RPC fails or is not yet deployed
            return manualExtendEntitlement(userId, productId, accessDays);
        }

        return data as Entitlement;
    } catch (err) {
        console.error('Critical failure in grantOrExtendEntitlement:', err);
        throw err;
    }
}

/**
 * Fallback manual implementation in case RPC is not available.
 * Note: RPC is preferred for atomic updates.
 */
async function manualExtendEntitlement(
    userId: string,
    productId: string,
    accessDays: number
): Promise<Entitlement | null> {
    // 1. Check existing
    const { data: existing } = await supabase
        .from('entitlements')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

    let expiresAt: Date;
    const now = new Date();

    if (existing && new Date(existing.expires_at) > now) {
        // Extend existing
        expiresAt = new Date(existing.expires_at);
        expiresAt.setDate(expiresAt.getDate() + accessDays);
    } else {
        // New or expired: Start from now
        expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + accessDays);
    }

    const { data, error } = await supabase
        .from('entitlements')
        .upsert({
            user_id: userId,
            product_id: productId,
            expires_at: expiresAt.toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Manual entitlement extension failed:', error);
        return null;
    }

    return data as Entitlement;
}

/**
 * Checks if a user has an active entitlement for a product.
 */
export async function hasActiveEntitlement(userId: string, productId: string): Promise<boolean> {
    const { data, error } = await supabase
        .from('entitlements')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

    if (error) {
        console.error('Error checking entitlement:', error);
        return false;
    }

    return !!data;
}

/**
 * Audits a commerce action.
 */
export async function auditCommerceAction(params: {
    actorUserId?: string;
    actorType: 'user' | 'system' | 'admin';
    action: string;
    entityType: string;
    entityId?: string;
    metadata?: any;
    ip?: string;
    userAgent?: string;
}) {
    const { error } = await supabase.from('audit_log').insert({
        actor_user_id: params.actorUserId,
        actor_type: params.actorType,
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        metadata: params.metadata || {},
        ip: params.ip,
        user_agent: params.userAgent
    });

    if (error) {
        console.error('Failed to write audit log:', error);
    }
}
