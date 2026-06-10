# Production Background Geolocation & Geofencing Setup

To enable seamless location updates when the rider's phone is locked, backgrounded, or operating in battery-saving mode, implement the native configurations detailed below.

---

## 1. Platform Permission Declarations

### Android Setup
Add the following permissions to your `AndroidManifest.xml` (or configure via Expo config plugin inside `app.json`):

```xml
<!-- Core GPS Permissions -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Required for Android 10+ (API level 29) background updates -->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- Required for Android 9+ (API level 28) Foreground Services -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
```

Declare the Foreground Service in the `<application>` block to prevent the OS kernel from killing the tracking service under memory pressure:

```xml
<service
    android:name="com.transistorsoft.rnbackgroundgeolocation.HeadlessTask"
    android:permission="android.permission.BIND_JOB_SERVICE"
    android:exported="true" />

<service
    android:name="com.transistorsoft.rnbackgroundgeolocation.BackgroundGeolocationService"
    android:foregroundServiceType="location"
    android:enabled="true"
    android:exported="false" />
```

### iOS Setup
Add the following keys to your `Info.plist`:

```xml
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Chapra Basket requires background location to track deliveries and update live customer ETAs.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>Chapra Basket requires location access to navigate to the customer store.</string>

<key>UIBackgroundModes</key>
<array>
    <string>location</string>
    <string>processing</string>
</array>
```

---

## 2. Dynamic Geofencing & Proximity Triggers

To transition from battery-saving idle polling to active delivery tracking, use geofencing circles:

### Store Proximity Zone
- **Trigger**: Rider enters a $200\text{m}$ radius around the Store coordinates.
- **Action**: Increase GPS accuracy from `POWER_CONSUMPTION_LOW` to `ACCURACY_HIGH`. Transition socket update intervals to $5\text{ seconds}$ to capture arrival.

### Customer Proximity Zone
- **Trigger**: Rider enters a $300\text{m}$ radius around the Customer coordinates.
- **Action**: Tighten location interval to $2\text{ seconds}$. Trigger a local haptic feedback push notification to the customer ("Your delivery partner is arriving shortly!").

---

## 3. Battery Optimization Integration

Configure the native tracking library (e.g., `react-native-background-geolocation` or custom Android Service) with dynamic energy thresholds:

```typescript
import BackgroundGeolocation from "react-native-background-geolocation";

BackgroundGeolocation.ready({
  // Desired accuracy in meters
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  
  // Distance in meters to travel before triggering a location update
  distanceFilter: 10,
  
  // Activity Recognition configurations
  stopTimeout: 5, // Keep GPS active for 5 mins after stopping
  stationaryRadius: 25, // Distance threshold to define stationary state
  
  // Power & Battery policies
  stopOnTerminate: false, // Continue tracking after app swipe-close
  startOnBoot: true,      // Resume tracking on phone reboot
  
  // Android Specific Notification UI
  notification: {
    title: "Live Delivery Active",
    text: "Chapra Basket is updating your location for live tracking.",
    color: "#E05A1F" // Brand color
  }
}).then((state) => {
  console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
});
```
