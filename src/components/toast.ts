import Toast from 'react-native-toast-message';
import * as Haptics from 'expo-haptics';

export const showSuccessToast = (title: string, message?: string) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  Toast.show({ type: 'success', text1: title, text2: message, visibilityTime: 2800 });
};

export const showErrorToast = (title: string, message?: string) => {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => undefined);
  Toast.show({ type: 'error', text1: title, text2: message, visibilityTime: 3500 });
};

export const showInfoToast = (title: string, message?: string) => {
  Toast.show({ type: 'info', text1: title, text2: message, visibilityTime: 2800 });
};
