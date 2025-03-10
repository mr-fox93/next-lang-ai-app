export async function getFlashcardsForGuest() { 
  return { 
    flashcards: [], 
    error: null 
  }; 
} 

export async function getProgressStatsForGuest() { 
  return { 
    success: true, 
    data: { 
      totalCards: 0, 
      cardsLearned: 0, 
      percentageLearned: 0, 
      categoriesProgress: [] 
    }, 
    error: null 
  }; 
}
