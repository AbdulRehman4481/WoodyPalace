import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string) => {
    return sonnerToast.success(message);
  },
  error: (message: string) => {
    return sonnerToast.error(message);
  },
  info: (message: string) => {
    return sonnerToast.info(message);
  },
  warning: (message: string) => {
    return sonnerToast.warning(message);
  },
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return sonnerToast.promise(promise, messages);
  },
};

