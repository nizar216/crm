import { AbstractControl, ValidationErrors } from '@angular/forms';

export function imageUrlValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) return null;

  const pattern = /\.(jpeg|jpg|gif|png|bmp|webp|svg)$/i;
  return pattern.test(value.trim()) ? null : { invalidImageUrl: true };
}