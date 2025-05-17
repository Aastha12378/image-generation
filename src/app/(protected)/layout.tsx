import { createClient } from "@/src/integrations/supabase/server";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase=await createClient()
  const { data: session } = await supabase.auth.getSession();
  if(!session){
    redirect('/login')
  }
  return children
}
