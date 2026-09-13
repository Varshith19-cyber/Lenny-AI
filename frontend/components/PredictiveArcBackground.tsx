'use client';

import "./threeui/threeui.css";
import { PredictiveArcCanvas } from "./threeui/PredictiveArcCanvas";

/**
 * Full-screen fixed background using the PredictiveArcCanvas (predictive variant).
 * Props match the configured usage:
 *   mode="dark" speed={1.00} hue={0} saturation={1.00} brightness={1.00}
 */
export function PredictiveArcBackground() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
    >
      <PredictiveArcCanvas
        mode="dark"
        speed={1.00}
        hue={0}
        saturation={1.00}
        brightness={1.00}
      />
    </div>
  );
}
