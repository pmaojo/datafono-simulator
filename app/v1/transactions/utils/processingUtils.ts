import { DEVICE_TYPE_CABLE, DEVICE_TYPE_WIFI } from "../constants";

export function getProcessingTime(deviceType: string): number {
  return deviceType === DEVICE_TYPE_WIFI ?
    Math.random() * 4000 + 2000 : // WIFI: 2-6 seconds
    Math.random() * 2000 + 1000;  // CABLE: 1-3 seconds - Assuming CABLE is the default if not WIFI
}
