import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../services/api/authApi';
import { secureStorage } from '../../services/storage/secureStorage';
import type { AuthState, Employee } from '../../types';

const initialState: AuthState = {
  employee: null,
  token: null,
  status: 'idle',
  pendingOtp: null,
};

// Every app launch/refresh must land on the login screen — sessions are never
// silently restored, even if a valid token is still stored from a prior run.
export const bootstrapAuth = createAsyncThunk<{ token: string; employee: Employee } | null>(
  'auth/bootstrap',
  async () => {
    await secureStorage.clearToken();
    return null;
  },
);

// Step 1 of login: validates credentials and issues a one-time code. This app
// has no real email/SMS provider connected, so the code comes back in the
// response (`devCode`) instead of actually being delivered — the UI shows it
// directly, the same way the existing "Demo login" hint already works.
export const requestLoginOtp = createAsyncThunk<
  { email: string; role: Employee['role']; devCode: string },
  { email: string; password: string; expectedRole?: Employee['role'] },
  { rejectValue: string }
>('auth/requestLoginOtp', async ({ email, password, expectedRole }, { rejectWithValue }) => {
  try {
    return await authApi.requestLoginOtp(email, password, expectedRole);
  } catch (error: any) {
    return rejectWithValue(error?.message ?? 'Could not send a verification code. Please try again.');
  }
});

// Step 2 of login: exchanges the code for a real session.
export const verifyLoginOtp = createAsyncThunk<
  { token: string; employee: Employee },
  { email: string; code: string },
  { rejectValue: string }
>('auth/verifyLoginOtp', async ({ email, code }, { rejectWithValue }) => {
  try {
    const result = await authApi.verifyLoginOtp(email, code);
    await secureStorage.setToken(result.token);
    return result;
  } catch (error: any) {
    return rejectWithValue(error?.message ?? 'That code is invalid or has expired.');
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
    clearPendingOtp(state) {
      state.pendingOtp = null;
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
      .addCase(requestLoginOtp.fulfilled, (state, action) => {
        state.pendingOtp = action.payload;
      })
      .addCase(verifyLoginOtp.pending, (state) => {
        state.status = 'checking';
      })
      .addCase(verifyLoginOtp.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.employee = action.payload.employee;
        state.status = 'authenticated';
        state.pendingOtp = null;
      })
      .addCase(verifyLoginOtp.rejected, (state) => {
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
        state.pendingOtp = null;
      });
  },
});

export const { updateEmployee, forceUnauthenticated, clearPendingOtp } = authSlice.actions;
export default authSlice.reducer;
