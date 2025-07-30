import { useState, useEffect, createContext, type ReactNode } from "react";
import {
    type User as FirebaseUser,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    createUserWithEmailAndPassword,
    updateProfile,
    onAuthStateChanged
} from "firebase/auth";
import { auth } from "../../lib/firebase";
import { type User, type AuthContextType } from "../../types";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (firebaseUser) {
                const userData: User = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email || "",
                    displayName: firebaseUser.displayName || ""
                };
                setUser(userData);
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            throw error;
        }
    };

    const register = async (email: string, password: string, displayName?: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            if (displayName && userCredential.user) {
                await updateProfile(userCredential.user, { displayName });
            }
        } catch (error) {
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        loading,
        signIn,
        signOut,
        register
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
