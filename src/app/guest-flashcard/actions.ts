export async function getFlashcardsForGuest() { 
  return { 
    flashcards: [], 
    error: undefined 
  }; 
} 

export async function getProgressStatsForGuest() { 
  return { 
    success: true, 
    data: { 
      totalFlashcards: 0, 
      masteredFlashcards: 0,
      inProgressFlashcards: 0,
      untouchedFlashcards: 0,
      categories: [],
      userLevel: 1,
      experiencePoints: 0,
      nextLevelPoints: 100,
      dailyGoal: 5
    }, 
    error: undefined 
  }; 
}
