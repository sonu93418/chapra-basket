import { Accelerometer, Gyroscope, Magnetometer } from 'expo-sensors';

export interface FusedState {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  accuracy: number;
  isDeadReckoning: boolean;
}

export class SensorFusionEngine {
  private lastGpsTime: number = 0;
  private lastUpdateTime: number = 0;
  
  // Current Fused State
  private currentLat: number = 0;
  private currentLng: number = 0;
  private currentHeading: number = 0;
  private currentSpeed: number = 0; // in m/s
  private currentAccuracy: number = 10;
  private isDeadReckoningActive: boolean = false;

  // Sensor reading caches
  private accelData = { x: 0, y: 0, z: 0 };
  private gyroData = { x: 0, y: 0, z: 0 };
  private magData = { x: 0, y: 0, z: 0 };

  // Subscriptions
  private subscriptions: any[] = [];
  private onStateUpdateCallback: ((state: FusedState) => void) | null = null;
  private intervalId: any = null;

  constructor(initialLat: number, initialLng: number, initialHeading: number = 0) {
    this.currentLat = initialLat;
    this.currentLng = initialLng;
    this.currentHeading = initialHeading;
    this.lastUpdateTime = Date.now();
    this.lastGpsTime = Date.now();
  }

  public start(callback: (state: FusedState) => void) {
    this.onStateUpdateCallback = callback;
    this.lastUpdateTime = Date.now();
    this.lastGpsTime = Date.now();
    this.isDeadReckoningActive = false;

    // Set update intervals for high frequency sensors (10Hz / 100ms)
    try {
      Accelerometer.setUpdateInterval(100);
      Gyroscope.setUpdateInterval(100);
      Magnetometer.setUpdateInterval(100);

      this.subscriptions.push(
        Accelerometer.addListener(data => {
          this.accelData = data;
        })
      );

      this.subscriptions.push(
        Gyroscope.addListener(data => {
          this.gyroData = data;
        })
      );

      this.subscriptions.push(
        Magnetometer.addListener(data => {
          this.magData = data;
        })
      );
    } catch (err) {
      console.warn('[SensorFusion] Hardware sensors are not available on this platform/device:', err);
    }

    // Periodical update loop (every 1 second) to compute dead reckoning and smooth coordinates
    this.intervalId = setInterval(() => {
      this.computeStep();
    }, 1000);
  }

  public stop() {
    this.subscriptions.forEach(sub => {
      try {
        sub.remove();
      } catch (err) {
        // Ignored
      }
    });
    this.subscriptions = [];
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Feeds a new GPS update from expo-location
   */
  public updateGPS(lat: number, lng: number, speed: number | null, heading: number | null, accuracy: number | null) {
    const now = Date.now();
    this.lastGpsTime = now;
    this.isDeadReckoningActive = false;

    this.currentLat = lat;
    this.currentLng = lng;
    this.currentSpeed = speed ?? 0;
    this.currentAccuracy = accuracy ?? 5;

    if (heading !== null && heading >= 0) {
      this.currentHeading = heading;
    }

    this.triggerUpdate();
  }

  /**
   * Periodical step calculation (fusing sensor inputs & computing dead reckoning if GPS is lost)
   */
  private computeStep() {
    const now = Date.now();
    const dt = (now - this.lastUpdateTime) / 1000; // time step in seconds
    this.lastUpdateTime = now;

    if (dt <= 0) return;

    // 1. Process Magnetometer heading
    let magHeading = this.currentHeading;
    if (this.magData.x !== 0 || this.magData.y !== 0) {
      const angleRad = Math.atan2(this.magData.y, this.magData.x);
      let angleDeg = (angleRad * 180) / Math.PI;
      // Convert to bearing (0 is North, clockwise)
      let bearing = 90 - angleDeg;
      if (bearing < 0) bearing += 360;
      if (bearing >= 360) bearing -= 360;
      magHeading = bearing;
    }

    // 2. Fused Heading (Complementary Filter between Gyroscope and Magnetometer)
    // Gyroscope.z is the rotation rate around vertical Z-axis in rad/s
    const gyroYawRateDeg = -(this.gyroData.z * 180) / Math.PI; // Negate to match clockwise bearing direction

    // complementary weight: 95% gyroscope integration, 5% magnetometer (absolute reference)
    let nextHeading = 0.95 * (this.currentHeading + gyroYawRateDeg * dt) + 0.05 * magHeading;
    if (nextHeading < 0) nextHeading += 360;
    if (nextHeading >= 360) nextHeading -= 360;
    this.currentHeading = nextHeading;

    // 3. Check GPS Signal Loss
    const timeSinceLastGps = now - this.lastGpsTime;
    
    // If we haven't received a GPS update for more than 4 seconds, engage Dead Reckoning
    if (timeSinceLastGps > 4000) {
      this.isDeadReckoningActive = true;
      this.currentAccuracy = Math.min(100, this.currentAccuracy + 1.5 * dt); // Accuracy degrades over time

      // Estimate acceleration magnitude excluding gravity
      const ax = this.accelData.x * 9.81;
      const ay = this.accelData.y * 9.81;
      const horizontalAccel = Math.sqrt(ax * ax + ay * ay);

      // If acceleration magnitude is very small, we assume speed is slowly decaying towards zero
      if (horizontalAccel < 0.5) {
        this.currentSpeed = Math.max(0, this.currentSpeed - 1.2 * dt); // slow deceleration
      } else {
        // Limit acceleration impact to prevent integration drift
        const deltaSpeed = Math.max(-3, Math.min(3, (horizontalAccel - 1.0) * dt));
        this.currentSpeed = Math.max(0, Math.min(15, this.currentSpeed + deltaSpeed)); // limit speed for delivery bikes to 15 m/s (54 km/h)
      }

      // Compute displacement along the current heading
      const displacement = this.currentSpeed * dt;

      if (displacement > 0) {
        // Convert heading to radians
        const headingRad = (this.currentHeading * Math.PI) / 180;
        
        // Earth radius scale approximation
        const dLat = (displacement * Math.cos(headingRad)) / 111111;
        const dLng = (displacement * Math.sin(headingRad)) / (111111 * Math.cos((this.currentLat * Math.PI) / 180));

        this.currentLat += dLat;
        this.currentLng += dLng;
      }
    }

    this.triggerUpdate();
  }

  private triggerUpdate() {
    if (this.onStateUpdateCallback) {
      this.onStateUpdateCallback({
        lat: Number(this.currentLat.toFixed(7)),
        lng: Number(this.currentLng.toFixed(7)),
        heading: Math.round(this.currentHeading),
        speed: Number((this.currentSpeed * 3.6).toFixed(1)), // convert m/s to km/h
        accuracy: Math.round(this.currentAccuracy),
        isDeadReckoning: this.isDeadReckoningActive,
      });
    }
  }
}
