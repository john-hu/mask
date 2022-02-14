import React from "react";
import ReactDOM from "react-dom";

import "./styles.css";

import { CAMERA_DEFAULT_FACING } from "./constants";
import { usePerfValue, useMaskDetection, useVideo } from "./hooks";

const Detector = () => {
  const perfValue = usePerfValue();
  const { videoStream, toggleVideoFacing } = useVideo(CAMERA_DEFAULT_FACING);
  const { model } = useMaskDetection(perfValue, videoStream);
  return (
    <div className="detector bp3-dark">
      <header className="detector-header">
        <div className="message-box">
          l: {perfValue.modelLoadTime} ms, w: {perfValue.modelWarmupTime} ms, d:{" "}
          {perfValue.detectCount} in {perfValue.detectTime} ms{" "}
          <button
            disabled={!videoStream || !model}
            type="button"
            onClick={toggleVideoFacing}
          >
            R
          </button>
        </div>
      </header>
      <video id="offscreen-video" autoPlay />
      {model && videoStream ? (
        <canvas id="canvas" className="viewport" />
      ) : (
        <div className="viewport loading">Loading video/model....</div>
      )}
    </div>
  );
};

const rootElement = document.getElementById("root");
ReactDOM.render(<Detector />, rootElement);
