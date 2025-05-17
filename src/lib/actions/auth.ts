"use server";
import { createClient } from "@/src/integrations/supabase/server";

export const signUpAction = async (email:string) => {
  const supabase = await createClient();

  // Ensure formData is an object with a single email property
  // if (Array.isArray(formData)) {
  //   if (formData.length !== 1) {
  //     throw new Error("Invalid input: Expected an array with a single object containing an email");
  //   }
  //   formData = formData[0];
  // }

  // if (!formData.email) {
  //   throw new Error("Email is required");
  // }
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (existingUser) {
    throw new Error("User already exists");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
      // emailRedirectTo: `${origin}/auth/callback`,
      // emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/brand`,
    },
  });

  if (error) {
    console.log(error.code + " " + error.message);
    throw new Error(error.message);
  }
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOtp({
    email: email,
    options: {
      shouldCreateUser: true,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
};

export const signOutAction = async () => {
  const supabase = await createClient();  
  await supabase.auth.signOut();
};

export async function verifyOtp(formData: FormData) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.verifyOtp({
    email: formData.get("email") as string,

    token: formData.get("otp") as string,
    type: "email",
  });
  if (error) {
    console.log(error.code + "------------------------- " + error.message);
  }
}

export async function resendOtp(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email: formData.get("email") as string,

    options: {
      shouldCreateUser: false,
    },
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function updateProfile(formData: {
  first_name: string;

  last_name: string;
  // avatar_url?: string;
}) {
  const supabase = await createClient();
  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated");
  }
  // Update user metadata
  const { error: updateError } = await supabase.auth.updateUser({
    data: {
      first_name: formData.first_name,
      last_name: formData.last_name,
      // avatar_url: formData.avatar_url
    },
  });
  if (updateError) {
    throw new Error(updateError.message);
  }
  // Also update users table
  const { error: usersUpdateError } = await supabase.from("users").upsert(
    {
      id: user.id,
      first_name: formData.first_name,
      last_name: formData.last_name,
      // avatar_url: formData.avatar_url,
      email: user.email,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (usersUpdateError) {
    throw new Error(usersUpdateError.message);
  }
  return { message: "Profile updated successfully", emailChanged: false };
}

export async function getUser() {
  try {
    const supabase = await createClient();    
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error.message);
      return {
        success: false,
        message: "Failed to fetch user data",
        error: error.message,
      };
    }

    if (!user) {
      console.warn("No user is currently authenticated.");
      return {
        success: false,
        message: "User not authenticated",
      };
    }

    console.log("User data:", user);
    return {
      success: true,
      data: user,
    };
  } catch (err: any) {
    console.error("An unexpected error occurred in getUser:", err);
    return {
      success: false,
      message: "An unexpected error occurred",
      error: err.message || err,
    };
  }
}
