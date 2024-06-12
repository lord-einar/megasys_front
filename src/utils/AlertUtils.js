// src/utils/alertUtils.js
import Swal from 'sweetalert2';

export const showLoadingAlert = () => {
  Swal.fire({
    title: 'Enviando...',
    text: 'Por favor, espera mientras enviamos la información',
    icon: 'info',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

export const showSuccessAlert = (message) => {
  Swal.fire({
    title: 'Éxito',
    text: message,
    icon: 'success'
  });
};

export const showErrorAlert = (message) => {
  Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error'
  });
};
