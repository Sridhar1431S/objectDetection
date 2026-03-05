export interface Detection {
  id: number;
  name: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

export const MOCK_DETECTIONS: Detection[] = [
  { id: 1, name: "Person", confidence: 0.97, x: 50, y: 30, width: 180, height: 340, color: "hsl(150, 100%, 45%)" },
  { id: 2, name: "Car", confidence: 0.91, x: 300, y: 200, width: 220, height: 140, color: "hsl(45, 100%, 55%)" },
  { id: 3, name: "Dog", confidence: 0.85, x: 500, y: 280, width: 100, height: 90, color: "hsl(200, 100%, 55%)" },
  { id: 4, name: "Bicycle", confidence: 0.78, x: 180, y: 250, width: 120, height: 110, color: "hsl(340, 100%, 55%)" },
  { id: 5, name: "Traffic Light", confidence: 0.94, x: 420, y: 10, width: 40, height: 90, color: "hsl(0, 100%, 55%)" },
];
