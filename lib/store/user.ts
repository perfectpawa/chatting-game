import { User } from '@supabase/supabase-js'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UserState {
    user: User | null,
    displayName?: string | null,
}

export const useUser = create<UserState>()(
    persist(
        (set) => ({
            user: null,
            displayName: null,
        }),
        {
            name: 'user-storage', // unique name for the storage
        }
    )
)

export const setUser = (user: User | null) => {
    useUser.setState({ user })
}

export const clearUser = () => {
    useUser.setState({ user: null })
}

export const getUser = () => {
    return useUser.getState().user
}

// Example usage:
// setUser(supabase.auth.user());
// const user = getUser();
// clearUser();

// Note: This store is used to manage the user state in the application.
// It allows setting, clearing, and getting the user information.
// The user information is persisted in localStorage for session persistence.
