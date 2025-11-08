import { Alert, Platform } from 'react-native';

/**
 * Cross-platform Alert utility
 * Works properly on both mobile and web
 */

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Show an alert dialog that works on both mobile and web
 * On mobile: Uses native Alert.alert
 * On web: Uses browser confirm() for simple dialogs
 */
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[]
): void {
  if (Platform.OS === 'web') {
    // Web implementation using confirm()
    if (!buttons || buttons.length === 0) {
      // Simple alert
      window.alert(`${title}\n${message || ''}`);
      return;
    }

    if (buttons.length === 1) {
      // Single button - just show alert
      window.alert(`${title}\n${message || ''}`);
      const button = buttons[0];
      if (button.onPress) {
        button.onPress();
      }
      return;
    }

    // Two buttons - use confirm()
    const confirmMessage = message ? `${title}\n\n${message}` : title;
    const result = window.confirm(confirmMessage);

    // Find the appropriate button based on result
    if (result) {
      // User clicked OK - find non-cancel button
      const confirmButton = buttons.find(b => b.style !== 'cancel');
      if (confirmButton?.onPress) {
        confirmButton.onPress();
      }
    } else {
      // User clicked Cancel - find cancel button
      const cancelButton = buttons.find(b => b.style === 'cancel');
      if (cancelButton?.onPress) {
        cancelButton.onPress();
      }
    }
  } else {
    // Mobile - use native Alert
    Alert.alert(title, message, buttons);
  }
}

/**
 * Show a simple alert with just an OK button
 */
export function showSimpleAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Show a confirmation dialog
 * Returns a promise that resolves to true if confirmed, false if cancelled
 */
export function showConfirm(
  title: string,
  message?: string,
  confirmText: string = 'Confirm',
  cancelText: string = 'Cancel'
): Promise<boolean> {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      const confirmMessage = message ? `${title}\n\n${message}` : title;
      const result = window.confirm(confirmMessage);
      resolve(result);
    } else {
      Alert.alert(
        title,
        message,
        [
          {
            text: cancelText,
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: confirmText,
            onPress: () => resolve(true),
          },
        ]
      );
    }
  });
}

/**
 * Show a delete confirmation dialog
 * Returns a promise that resolves to true if confirmed
 */
export function showDeleteConfirm(
  itemName: string,
  message?: string
): Promise<boolean> {
  const defaultMessage = `Are you sure you want to delete ${itemName}?`;
  return showConfirm(
    'Delete Confirmation',
    message || defaultMessage,
    'Delete',
    'Cancel'
  );
}

