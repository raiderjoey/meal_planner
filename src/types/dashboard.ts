export interface PrepTask {
  id: string;
  description: string;
  isCompleted: boolean;
  recipeId: string;
}

export interface DayDetailProps {
  date: string;
}
