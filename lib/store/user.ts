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
            name: 'user',
        }
    )
)