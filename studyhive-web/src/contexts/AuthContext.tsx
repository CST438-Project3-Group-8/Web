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

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [bootstrapError, setBootstrapError] = useState<string | null>(null);
    const bootstrappedTokenRef = useRef<string | null>(null);

    useEffect(() => {
        async function runBootstrapWithRetry() {
            let lastError: unknown;

            for (let attempt = 0; attempt <= BOOTSTRAP_RETRY_DELAYS_MS.length; attempt += 1) {
                try {
                    await createProfile();
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

            try {
                await runBootstrapWithRetry();
                bootstrappedTokenRef.current = activeSession.access_token;
                setBootstrapError(null);
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
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/dashboard` },
        });
    };

    const signInWithGitHub = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: `${window.location.origin}/dashboard` },
        });
    };

    const signOut = async () => {
        bootstrappedTokenRef.current = null;
        setBootstrapError(null);
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

        try {
            await runBootstrapWithRetry();
            bootstrappedTokenRef.current = activeSession.access_token;
            setBootstrapError(null);
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
