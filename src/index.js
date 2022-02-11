import React from "react";
import ReactDOM from "react-dom";

import { usePerfValue, useMaskDetection, useVideo } from "./hooks";
import "./styles.css";

const Detector = () => {
  const perfValue = usePerfValue();
  const videoStream = useVideo();
  const { model } = useMaskDetection(perfValue, videoStream);
  return (
    <div className="detector">
      <div className="message-box">
        l: {perfValue.modelLoadTime} ms, w: {perfValue.modelWarmupTime}{" "}
        ms, d: {perfValue.detectCount} in {perfValue.detectTime} ms
      </div>
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
