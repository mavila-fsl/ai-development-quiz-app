import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '@ai-quiz-app/shared';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const response: ApiResponse<null> = {
      success: false,
      error: 'Validation failed',
      message: errors.array()[0].msg,
    };
    return res.status(400).json(response);
  }
  next();
};
