import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

interface authState {
	user: any; 
	token: string; 
	isAuthenticated: boolean; 
}

interface authActions {
	setToken: (token: string) => void; 
	userData: (user: any) => void; 
	logout: () => void; 
}

const initialState: authState = {
	user: null, 
	token: "", 
	isAuthenticated: false, 
}


export const useAuthStore = create<authState & authActions>()(
	persist(
		(set) => ({
			...initialState, 
			setToken: (token: string) => set({ token }), 
			userData: (user: any) => set({ user, isAuthenticated: true }), 
			logout: () => set(initialState), 
		}), 
		{
			name: "auth-storage", 
			storage: createJSONStorage(() => localStorage), 
		}
	)
)	
