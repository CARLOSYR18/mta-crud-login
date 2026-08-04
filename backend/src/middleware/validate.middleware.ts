import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodTypeAny } from 'zod';

type RequestPart = 'body' | 'params' | 'query';

export function validate(schema: ZodTypeAny, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[part]);
      // Sobreescribimos con los datos ya validados/transformados (trim, lowercase, coerce, etc.)
      (req as any)[part] = parsed;
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: 'Datos de entrada inválidos',
          errors: error.errors.map((e) => ({
            campo: e.path.join('.'),
            mensaje: e.message,
          })),
        });
      }
      next(error);
    }
  };
}
