import React from "react";
import useDeviceDetection from "../hooks/useDeviceDetection";

const DeviceDebugInfo = ({ show = false }) => {
  const deviceInfo = useDeviceDetection();

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 font-mono">
      <h4 className="text-yellow-400 font-bold mb-2">Device Debug Info:</h4>
      <div>
        Screen: {deviceInfo.screenWidth}x{deviceInfo.screenHeight}
      </div>
      <div>Mobile: {deviceInfo.isMobile ? "✅" : "❌"}</div>
      <div>Tablet: {deviceInfo.isTablet ? "✅" : "❌"}</div>
      <div>Desktop: {deviceInfo.isDesktop ? "✅" : "❌"}</div>
      <div>Touch: {deviceInfo.touchSupport ? "✅" : "❌"}</div>
      <div className="mt-2 text-gray-400 text-xs">
        UA: {deviceInfo.userAgent.substring(0, 30)}...
      </div>
    </div>
  );
};

export default DeviceDebugInfo;
