export interface Goal {
  id: number;
  text: string;
  createdAt: string;
}

export type GoalAction =
  | { type: "ADD"; payload: string }
  | { type: "UPDATE"; payload: { id: number; text: string } }
  | { type: "DELETE"; payload: number };

export function goalsReducer(state: Goal[], action: GoalAction): Goal[] {
  switch (action.type) {
    case "ADD":
      return [
        ...state,
        {
          id: Date.now(),
          text: action.payload,
          createdAt: new Date().toLocaleDateString("ko-KR"),
        },
      ];
    case "UPDATE":
      return state.map((goal) =>
        goal.id === action.payload.id
          ? { ...goal, text: action.payload.text }
          : goal,
      );
    case "DELETE":
      return state.filter((goal) => goal.id !== action.payload);
    default:
      throw new Error(`Unknown action: ${(action as any).type}`);
  }
}
