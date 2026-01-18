"use server";

import { auth } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-helpers";
import { getAddFavoriteUseCase, getRemoveFavoriteUseCase, getUserFavoritesUseCase } from "@/lib/container";
import { cookies } from "next/headers";
import { defaultLocale } from "@/i18n/routing";
import { revalidatePath } from "next/cache";

export async function addFavoriteAction(flashcardId: number) {
  try {
    if (await isDemoMode()) {
      return {
        success: false,
        error: "Demo mode: Please sign in to add favorites"
      };
    }

    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in"
      };
    }

    const result = await getAddFavoriteUseCase().execute({ userId, flashcardId });

    if (result.error) {
      return {
        success: false,
        error: result.error
      };
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || defaultLocale;

    revalidatePath(`/${locale}/favorite`);
    revalidatePath(`/${locale}/flashcards`);

    return {
      success: true,
      data: result.favorite
    };
  } catch (error) {
    console.error("Add favorite action error:", error);
    return {
      success: false,
      error: `Failed to add favorite: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`
    };
  }
}

export async function removeFavoriteAction(flashcardId: number) {
  try {
    if (await isDemoMode()) {
      return {
        success: false,
        error: "Demo mode: Please sign in to manage favorites"
      };
    }

    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in"
      };
    }

    const result = await getRemoveFavoriteUseCase().execute({ userId, flashcardId });

    if (result.error) {
      return {
        success: false,
        error: result.error
      };
    }

    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || defaultLocale;

    revalidatePath(`/${locale}/favorite`);
    revalidatePath(`/${locale}/flashcards`);

    return {
      success: true
    };
  } catch (error) {
    console.error("Remove favorite action error:", error);
    return {
      success: false,
      error: `Failed to remove favorite: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`
    };
  }
}

export async function getUserFavoritesAction() {
  try {
    if (await isDemoMode()) {
      return {
        success: true,
        data: []
      };
    }

    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Authentication required: User is not signed in",
        data: []
      };
    }

    const result = await getUserFavoritesUseCase().execute(userId);

    if (result.error) {
      return {
        success: false,
        error: result.error,
        data: []
      };
    }

    return {
      success: true,
      data: result.favorites
    };
  } catch (error) {
    console.error("Get favorites action error:", error);
    return {
      success: false,
      error: `Failed to retrieve favorites: ${
        error instanceof Error ? error.message : "Unknown error occurred"
      }`,
      data: []
    };
  }
}
