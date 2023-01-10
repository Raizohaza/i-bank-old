import { Document } from 'mongoose';

export interface IToken extends Document {
  customer_id: string;
  token: string;
  refreshToken?: string | null;
  tokenExp?: string;
  refreshTokenExp?: string;
}
