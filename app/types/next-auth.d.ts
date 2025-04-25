// types/next-auth.d.ts

import { Role } from "@/models/roles";
import { DefaultSession, DefaultUser } from "next-auth";


declare module "next-auth" {

    interface User extends DefaultUser {
        id: string;
        role?: Role;
    }
    interface Session extends DefaultSession {
        user?: User;
    }
}
declare module "next-auth/jwt" {
    interface JWT extends User {
        id: string;
        role?: Role;
    }
}