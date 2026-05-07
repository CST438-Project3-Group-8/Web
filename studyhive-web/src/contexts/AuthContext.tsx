import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import type { ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { createProfile } from '../api/userApi';
import type { BackendOAuthProvider, BootstrapProfilePayload } from '../api/userApi';
import { getApiErrorMessage } from '../lib/apiErrors';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    loading: boolean;
    bootstrapError: string | null;
    signInWithGoogle: () => Promise<void>;
    signInWithGitHub: () => Promise<void>;
    signOut: () => Promise<void>;
    retryBootstrap: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const BOOTSTRAP_RETRY_DELAYS_MS = [400, 900, 1500, 2200];
const PENDING_PROVIDER_STORAGE_KEY = 'studyhive-auth-pending-provider';

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeJwtPayload(token: string) {
    try {
        const [, payload] = token.split('.');
        if (!payload) return null;

        const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
        const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
        return JSON.parse(window.atob(padded)) as Record<string, unknown>;
    } catch {
        return null;
    }
}

function storePendingProvider(provider: 'google' | 'github') {
    window.sessionStorage.setItem(PENDING_PROVIDER_STORAGE_KEY, provider);
}

function getPendingProvider() {
    return window.sessionStorage.getItem(PENDING_PROVIDER_STORAGE_KEY);
}

function clearPendingProvider() {
    window.sessionStorage.removeItem(PENDING_PROVIDER_STORAGE_KEY);
}

function normalizeProvider(raw: unknown): 'google' | 'github' | 'email' | null {
    if (typeof raw !== 'string') return null;
    const normalized = raw.trim().toLowerCase();
    if (normalized === 'google' || normalized === 'github' || normalized === 'email') {
        return normalized;
    }

    return null;
}

function toBackendProvider(raw: 'google' | 'github' | 'email' | null): BackendOAuthProvider | null {
    if (raw === 'google') return 'GOOGLE';
    if (raw === 'github') return 'GITHUB';
    if (raw === 'email') return 'EMAIL';
    return null;
}

function readProviders(value: unknown) {
    if (!Array.isArray(value)) return [];

    return value
        .map((entry) => normalizeProvider(entry))
        .filter((entry): entry is 'google' | 'github' | 'email' => entry !== null);
}

function resolveBootstrapProvider(activeSession: Session, tokenPayload: Record<string, unknown> | null) {
    const pendingProvider = normalizeProvider(getPendingProvider());
    const sessionProvider = normalizeProvider(activeSession.user?.app_metadata?.provider);
    const tokenProvider = normalizeProvider(tokenPayload?.provider);
    const tokenAppMetadataProvider =
        typeof tokenPayload?.app_metadata === 'object' && tokenPayload.app_metadata !== null
            ? normalizeProvider((tokenPayload.app_metadata as { provider?: unknown }).provider)
            : null;
    const accountProviders = [
        ...readProviders(activeSession.user?.app_metadata?.providers),
        ...(
            typeof tokenPayload?.app_metadata === 'object' && tokenPayload.app_metadata !== null
                ? readProviders((tokenPayload.app_metadata as { providers?: unknown }).providers)
                : []
        ),
    ];
    const uniqueAccountProviders = Array.from(new Set(accountProviders));
    const oauthAccountProviders = uniqueAccountProviders.filter((provider) => provider !== 'email');
    const hasOAuthSessionToken = !!activeSession.provider_token;

    let selectedProvider: 'google' | 'github' | 'email' | null = null;
    let reason = 'no confident provider signal';

    if (pendingProvider && pendingProvider !== 'email' && hasOAuthSessionToken) {
        selectedProvider = pendingProvider;
        reason = 'pending OAuth provider saved before redirect';
    } else if (hasOAuthSessionToken && oauthAccountProviders.length === 1) {
        selectedProvider = oauthAccountProviders[0];
        reason = 'OAuth session token present with a single OAuth provider linked';
    } else if (hasOAuthSessionToken && tokenProvider && tokenProvider !== 'email') {
        selectedProvider = tokenProvider;
        reason = 'OAuth session token present and token provider is OAuth-specific';
    } else if (hasOAuthSessionToken && tokenAppMetadataProvider && tokenAppMetadataProvider !== 'email') {
        selectedProvider = tokenAppMetadataProvider;
        reason = 'OAuth session token present and token app metadata provider is OAuth-specific';
    } else if (sessionProvider) {
        selectedProvider = sessionProvider;
        reason = 'using session app metadata provider';
    } else if (tokenProvider) {
        selectedProvider = tokenProvider;
        reason = 'using token provider claim';
    } else if (tokenAppMetadataProvider) {
        selectedProvider = tokenAppMetadataProvider;
        reason = 'using token app metadata provider';
    }

    const backendProvider = toBackendProvider(selectedProvider);
    const bootstrapPayload: BootstrapProfilePayload | undefined = backendProvider
        ? { oauthProvider: backendProvider }
        : undefined;

    return {
        bootstrapPayload,
        debug: {
            pendingProvider,
            sessionProvider,
            tokenProvider,
            tokenAppMetadataProvider,
            accountProviders: uniqueAccountProviders,
            hasOAuthSessionToken,
            selectedProvider,
            backendProvider,
            reason,
        },
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [bootstrapError, setBootstrapError] = useState<string | null>(null);
    const bootstrappedTokenRef = useRef<string | null>(null);

    useEffect(() => {
        async function runBootstrapWithRetry(payload?: BootstrapProfilePayload) {
            let lastError: unknown;

            for (let attempt = 0; attempt <= BOOTSTRAP_RETRY_DELAYS_MS.length; attempt += 1) {
                try {
                    await createProfile(payload);
                    return;
                } catch (error) {
                    lastError = error;

                    if (attempt === BOOTSTRAP_RETRY_DELAYS_MS.length) {
                        throw error;
                    }

                    await sleep(BOOTSTRAP_RETRY_DELAYS_MS[attempt]);
                }
            }

            throw lastError;
        }

        async function bootstrapAuthenticatedUser(activeSession: Session | null) {
            const tokenPayload = activeSession?.access_token
                ? decodeJwtPayload(activeSession.access_token)
                : null;

            setSession(activeSession);
            setUser(activeSession?.user ?? null);

            if (!activeSession) {
                bootstrappedTokenRef.current = null;
                setBootstrapError(null);
                setLoading(false);
                return;
            }

            if (bootstrappedTokenRef.current === activeSession.access_token) {
                setBootstrapError(null);
                setLoading(false);
                return;
            }

            setLoading(true);
            setBootstrapError(null);

            const { bootstrapPayload } = resolveBootstrapProvider(activeSession, tokenPayload);

            try {
                await runBootstrapWithRetry(bootstrapPayload);
                bootstrappedTokenRef.current = activeSession.access_token;
                setBootstrapError(null);
                clearPendingProvider();
            } catch (error) {
                bootstrappedTokenRef.current = null;
                setBootstrapError(getApiErrorMessage(error, 'We could not finish signing you in. Please try again.'));
            } finally {
                setLoading(false);
            }
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            void bootstrapAuthenticatedUser(session);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                void bootstrapAuthenticatedUser(session);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        storePendingProvider('google');
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/dashboard` },
        });
    };

    const signInWithGitHub = async () => {
        storePendingProvider('github');
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: `${window.location.origin}/dashboard` },
        });
    };

    const signOut = async () => {
        bootstrappedTokenRef.current = null;
        setBootstrapError(null);
        clearPendingProvider();
        await supabase.auth.signOut();
    };

    const retryBootstrap = async () => {
        setLoading(true);
        setBootstrapError(null);

        const { data: { session: activeSession } } = await supabase.auth.getSession();
        setSession(activeSession);
        setUser(activeSession?.user ?? null);

        if (!activeSession) {
            setLoading(false);
            return;
        }

        const tokenPayload = activeSession.access_token
            ? decodeJwtPayload(activeSession.access_token)
            : null;
        const { bootstrapPayload } = resolveBootstrapProvider(activeSession, tokenPayload);

        try {
            await runBootstrapWithRetry(bootstrapPayload);
            bootstrappedTokenRef.current = activeSession.access_token;
            setBootstrapError(null);
            clearPendingProvider();
        } catch (error) {
            bootstrappedTokenRef.current = null;
            setBootstrapError(getApiErrorMessage(error, 'We could not finish signing you in. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider
            value={{ session, user, loading, bootstrapError, signInWithGoogle, signInWithGitHub, signOut, retryBootstrap }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// No explicit return type — TypeScript infers AuthContextType after the throw narrows out undefined
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (ctx === undefined) throw new Error('useAuth must be used inside AuthProvider');
    return ctx;
}
