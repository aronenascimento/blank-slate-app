import * as z from 'zod';

export const taskTitleSchema = z.string()
  .min(1, { message: 'O título é obrigatório.' })
  .max(255, { message: 'O título não pode exceder 255 caracteres.' });

export const taskDescriptionSchema = z.string()
  .max(1000, { message: 'A descrição não pode exceder 1000 caracteres.' })
  .optional();