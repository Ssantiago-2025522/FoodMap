import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function matchPasswordValidator(
  passwordField: string = 'contrasena',
  confirmField: string = 'confirmarContrasena'
): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get(passwordField);
    const confirmPassword = control.get(confirmField);

    if (!password || !confirmPassword) {
      return null;
    }

    if (
      confirmPassword.errors &&
      !confirmPassword.errors['passwordsMismatch']
    ) {
      return null;
    }

    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordsMismatch: true });
      return { passwordsMismatch: true };
    } else {
      confirmPassword.setErrors(null);
      return null;
    }
  };
}