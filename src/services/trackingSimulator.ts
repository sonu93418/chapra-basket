import { emitRiderLocation } from './socket';

interface LatLng {
  lat: number;
  lng: number;
}

// Predefined realistic route points representing turns from Store to Customer in Chapra
const MOCK_ROUTE: LatLng[] = [
  { lat: 25.7782, lng: 84.7352 }, // Store start
  { lat: 25.7780, lng: 84.7355 },
  { lat: 25.7777, lng: 84.7358 },
  { lat: 25.7773, lng: 84.7360 },
  { lat: 25.7770, lng: 84.7362 }, // Turn point
  { lat: 25.7766, lng: 84.7363 },
  { lat: 25.7761, lng: 84.7364 },
  { lat: 25.7758, lng: 84.7366 }, // Intersection
  { lat: 25.7754, lng: 84.7368 },
  { lat: 25.7749, lng: 84.7370 },
  { lat: 25.7745, lng: 84.7372 },
  { lat: 25.7742, lng: 84.7373 },
  { lat: 25.7740, lng: 84.7374 }, // Customer arrival
];

// Helper to calculate bearing (angle) between two geocoordinates
function calculateBearing(start: LatLng, end: LatLng): number {
  const startLat = (start.lat * Math.PI) / 180;
  const startLng = (start.lng * Math.PI) / 180;
  const endLat = (end.lat * Math.PI) / 180;
  const endLng = (end.lng * Math.PI) / 180;

  const dLon = endLng - startLng;
  const y = Math.sin(dLon) * Math.cos(endLat);
  const x =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLon);

  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

export class TrackingSimulator {
  private orderId: string;
  private timer: NodeJS.Timeout | null = null;
  private currentStep = 0;
  private isRunning = false;
  private onStepCallback?: (coord: LatLng & { heading: number; eta: number }) => void;

  constructor(orderId: string) {
    this.orderId = orderId;
  }

  public start(onStep?: (coord: LatLng & { heading: number; eta: number }) => void) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.currentStep = 0;
    this.onStepCallback = onStep;

    this.runLoop();
  }

  public stop() {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private runLoop() {
    if (!this.isRunning) return;

    const currentCoord = MOCK_ROUTE[this.currentStep];
    const nextIndex = Math.min(this.currentStep + 1, MOCK_ROUTE.length - 1);
    const nextCoord = MOCK_ROUTE[nextIndex];

    const heading = calculateBearing(currentCoord, nextCoord);

    // Dynamic polling based on proximity to target:
    // Near customer (within last 3 steps), speed up interval to 2s, otherwise 4s
    const stepsRemaining = MOCK_ROUTE.length - 1 - this.currentStep;
    const interval = stepsRemaining <= 3 ? 2000 : 4000;

    // Simulate simple ETA remaining
    const eta = Math.max(1, Math.ceil(stepsRemaining * 0.3));

    // Emit live socket event
    emitRiderLocation({
      orderId: this.orderId,
      lat: currentCoord.lat,
      lng: currentCoord.lng,
      heading,
      eta,
    });

    if (this.onStepCallback) {
      this.onStepCallback({ ...currentCoord, heading, eta });
    }

    if (this.currentStep < MOCK_ROUTE.length - 1) {
      this.currentStep++;
      this.timer = setTimeout(() => this.runLoop(), interval);
    } else {
      console.log('[Simulator] Route completed.');
      this.isRunning = false;
    }
  }
}
