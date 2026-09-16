import {createSlice, type PayloadAction} from '@reduxjs/toolkit';

interface DecodedToken {
    sub: string;
    roles: string[];
}

interface AuthState {
    token: string | null;
    email: string | null;
    roles: string[];
    fullName: string | null;
}

function decodeToken(token: string): DecodedToken {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
}

function getInitialState(): AuthState {
    const token = localStorage.getItem('token');
    const cachedName = localStorage.getItem('fullName');
    if (!token) return { token: null, email: null, roles: [], fullName: null };

    try {
        const decoded = decodeToken(token);
        return {
            token,
            email: decoded.sub,
            roles: decoded.roles.map(r => r.replace('ROLE_', '')),
            fullName: cachedName,
        };
    } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('fullName');
        return { token: null, email: null, roles: [], fullName: null };
    }
}

const authSlice = createSlice({
    name: 'auth',
    initialState: getInitialState(),
    reducers: {
        setToken: (state, action: PayloadAction<string>) => {
            const decoded = decodeToken(action.payload);
            state.token = action.payload;
            state.email = decoded.sub;
            state.roles = decoded.roles.map(r => r.replace('ROLE_', ''));
            localStorage.setItem('token', action.payload);
        },
        setFullName: (state, action: PayloadAction<string>) => {
            state.fullName = action.payload;
            localStorage.setItem('fullName', action.payload);
        },
        logout: (state) => {
            state.token = null;
            state.email = null;
            state.roles = [];
            state.fullName = null;
            localStorage.removeItem('token');
            localStorage.removeItem('fullName');
        },
    },
});

export const {setToken, setFullName, logout} = authSlice.actions;
export default authSlice.reducer;