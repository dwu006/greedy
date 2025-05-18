
import { createBrowserClient } from "@supabase/ssr";
import dotenv from "dotenv";
dotenv.config({path: "../.env"});

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
