import { createContext} from "react";

export type UserDetail = {
  _id?: string
  [key: string]: unknown
} | null

export const UserDetailContext = createContext<UserDetail>(null)