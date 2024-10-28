export type TUserSchema = {
  id: number;
  balance: number;
  name: string;
  password: string;
  token: string | null;
  created_at: Date;
  updated_at: Date;
};
