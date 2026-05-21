import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(10, 'Mínimo 10 caracteres')
  .regex(/[A-Z]/, 'Necesita una mayúscula')
  .regex(/[a-z]/, 'Necesita una minúscula')
  .regex(/\d/, 'Necesita un número');

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal('')),
  password: passwordSchema,
  role: z.enum(['VECINO', 'ADMIN_FINCAS']),
  gdprAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar el tratamiento de datos' }),
  }),
});
export type RegisterValues = z.infer<typeof registerSchema>;

export const acceptInvitationSchema = z.object({
  password: passwordSchema,
  gdprAccepted: z.literal(true, {
    errorMap: () => ({ message: 'Debes aceptar el tratamiento de datos' }),
  }),
});
export type AcceptInvitationValues = z.infer<typeof acceptInvitationSchema>;
