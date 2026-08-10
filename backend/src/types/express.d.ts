import { JwtPayload } from './api';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
