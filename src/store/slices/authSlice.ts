import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api/authApi';
import { secureStorage } from '../../services/storage/secureStorage';
import type { AuthState, Employee } from '../../types';

const initialState: AuthState = {
  employee: null,
  token: null,
  status: 'idle',
};

export const bootstrapAuth = createAsyncThunk<{ token: string; employee: Employee } | null>(
  'auth/bootstrap',
  async () => {
    const token = await secureStorage.getToken();
    if (!token) return null;
    try {
      const employee = await authApi.getSessionEmployee(token);
      return { token, employee };
    } catch {
      await secureStorage.clearToken();
      return null;
    }
  },
);

export const login = createAsyncThunk<
  { token: string; employee: Employee },
  { email: string; password: string; expectedRole?: Employee['role'] },
  { rejectValue: string }
>('auth/login', async ({ email, password, expectedRole }, { rejectWithValue }) => {
  try {
    const result = await authApi.login(email, password, expectedRole);
    await secureStorage.setToken(result.token);
    return result;
  } catch (error: any) {
    return rejectWithValue(error?.message ?? 'Login failed. Please try again.');
  }
});

export const register = createAsyncThunk<
  { token: string; employee: Employee },
  {
    employeeId: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    password: string;
    managerId: string;
  },
  { rejectValue: string }
>('auth/register', async (input, { rejectWithValue }) => {
  try {
    const result = await authApi.register(input);
    await secureStorage.setToken(result.token);
    return result;
  } catch (error: any) {
    return rejectWithValue(error?.message ?? 'Registration failed. Please try again.');
  }
});

export const logout = createAsyncThunk<void, void, { state: { auth: AuthState } }>(
  'auth/logout',
  async (_, { getState }) => {
    const { token } = getState().auth;
    if (token) {
      await authApi.logout(token).catch(() => undefined);
    }
    await secureStorage.clearToken();
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    updateEmployee(state, action: PayloadAction<Employee>) {
      state.employee = action.payload;
    },
    forceUnauthenticated(state) {
      state.employee = null;
      state.token = null;
      state.status = 'unauthenticated';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'checking';
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.token = action.payload.token;
          state.employee = action.payload.employee;
          state.status = 'authenticated';
        } else {
          state.status = 'unauthenticated';
        }
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.status = 'unauthenticated';
      })
      .addCase(login.pending, (state) => {
        state.status = 'checking';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.employee = action.payload.employee;
        state.status = 'authenticated';
      })
      .addCase(login.rejected, (state) => {
        state.status = 'unauthenticated';
      })
      .addCase(register.pending, (state) => {
        state.status = 'checking';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.employee = action.payload.employee;
        state.status = 'authenticated';
      })
      .addCase(register.rejected, (state) => {
        state.status = 'unauthenticated';
      })
      .addCase(logout.fulfilled, (state) => {
        state.token = null;
        state.employee = null;
        state.status = 'unauthenticated';
      });
  },
});

export const { updateEmployee, forceUnauthenticated } = authSlice.actions;
export default authSlice.reducer;
