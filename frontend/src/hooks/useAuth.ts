import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { authService, LoginInput, RegisterInput } from '../services/authService';

export function useLogin() {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useRegister() {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (data) => {
      login(data.user, data.accessToken, data.refreshToken);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
    },
    onError: () => {
      // Logout locally even if API call fails
      logout();
    },
  });
}

export function useAuth() {
  const { user, isAuthenticated, logout } = useAuthStore();
  return { user, isAuthenticated, logout };
}
