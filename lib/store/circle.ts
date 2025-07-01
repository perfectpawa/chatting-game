import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CircleData {
  circleId: string;
  size: number;
  left: number;
  top: number;
  duration: number;
  delay: number;
  angle: number;
  isNamed: boolean;
  name: string | null;
  namePopDuration: number;
  namePopDelay: number;
  isUser: boolean;
  isWaiting: boolean;
}

interface CircleState {
  circles: CircleData[];
  setCircles: (circles: CircleData[] | ((prev: CircleData[]) => CircleData[])) => void;
}

export const useCircleStore = create<CircleState>()(
  persist(
    (set) => ({
      circles: [],
      setCircles: (circlesOrFn) =>
        set((state) => ({
          circles:
            typeof circlesOrFn === 'function'
              ? (circlesOrFn as (prev: CircleData[]) => CircleData[])(state.circles)
              : circlesOrFn,
        })),
    }),
    {
      name: 'circle-state',
      // storage: localStorage by default
    }
  )
); 