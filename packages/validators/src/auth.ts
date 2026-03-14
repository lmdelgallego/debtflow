import { z } from 'zod';

export const signinSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type SigninFormValues = z.infer<typeof signinSchema>;

export const signupSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido.",
  }),
  password: z.string().min(8, {
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export type SignupFormValues = z.infer<typeof signupSchema>;
