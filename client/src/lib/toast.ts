import { toast } from 'svelte-french-toast';

export function showSuccess(message: string) {
  toast.push(message, {
    theme: {
      '--toastBackground': '#48BB78',  
      '--toastBarBackground': '#2F855A'  
    }
  });
}

export function showError(message: string) {
  toast.push(message, {
    theme: {
      '--toastBackground': '#F56565',  
      '--toastBarBackground': '#C53030'  
    }
  });
}
