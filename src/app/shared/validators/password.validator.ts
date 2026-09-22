import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    const hasMinLength = value.length >= 8;
    const hasNumber = /[0-9]/.test(value);
    const hasUpperCase = /[A-Z]/.test(value);

    const valid = hasMinLength && hasNumber && hasUpperCase;

    return !valid
      ? {
          passwordStrength: {
            hasMinLength,
            hasNumber,
            hasUpperCase,
          },
        }
      : null;
  };
}