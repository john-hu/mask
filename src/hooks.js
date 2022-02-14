import { useCallback, useEffect, useRef, useState } from "react";
import {
  MODEL_SIZE,
  WEIGHTS_PATH,
  CAMERA_DEFAULT_FACING,
  CAMERA_FACING,
} from "./constants";
import { cropToCanvas, drawDetections, prepareCanvas } from "./utils";

const tf = require("@tensorflow/tfjs");

const unboxingDetection = async ([boxes, scores, classes, detections]) => {
  const [boxesData, scoresData, classesData, validCount] = await Promise.all([
    boxes.data(),
    scores.data(),
    classes.data(),
    detections.data(),
  ]);
  return {
    boxesData,
    scoresData,
    classesData,
    validCount: validCount[0],
  };
};

const loadModel = async () => {
  const webgl = await tf.setBackend("webgl");
  if (!webgl) {
    alert("No WebGL found. The performance may not be good.");
  }
  // load model
  const startTime = new Date().getTime();
  const model = await tf.loadGraphModel(WEIGHTS_PATH);
  const modelLoadTime = new Date().getTime() - startTime;
  console.log("load time", modelLoadTime);
  // warm up
  const input = tf.tidy(() => tf.zeros([1, ...MODEL_SIZE, 3]));
  const warmupStart = new Date().getTime();
  await model.executeAsync(input);
  const modelWarmupTime = new Date().getTime() - warmupStart;
  console.log("warmup time", modelWarmupTime);
  return { model, modelLoadTime, modelWarmupTime };
};

export const usePerfValue = () => {
  const [modelLoadTime, setModelLoadTime] = useState(0);
  const [modelWarmupTime, setModelWarmupTime] = useState(0);
  const [detectTime, setDetectTime] = useState(0);
  const [detectCount, setDetectCount] = useState(0);

  return {
    modelLoadTime,
    modelWarmupTime,
    detectTime,
    detectCount,
    setDetectCount,
    setModelLoadTime,
    setModelWarmupTime,
    setDetectTime,
  };
};

export const useMaskDetection = (perfValue, videoStream) => {
  const timerRef = useRef(null);
  const [model, setModel] = useState(null);
  const {
    setModelLoadTime,
    setModelWarmupTime,
    setDetectTime,
    setDetectCount,
  } = perfValue;
  useEffect(() => {
    let model;
    (async () => {
      const modelResult = await loadModel();
      setModelLoadTime(modelResult.modelLoadTime);
      setModelWarmupTime(modelResult.modelWarmupTime);
      setModel(modelResult.model);
      model = modelResult.model;
      // let's rock'n'roll.
    })();
    return () => model && model.dispose();
  }, [setModelLoadTime, setModelWarmupTime]);

  useEffect(() => {
    if (!model || !videoStream) {
      return;
    }
    const drawImage = async () => {
      const { canvas, ctx } = prepareCanvas("canvas");
      cropToCanvas(document.getElementById("offscreen-video"), canvas, ctx);
      const input = tf.tidy(() =>
        tf.image
          .resizeBilinear(tf.browser.fromPixels(canvas), MODEL_SIZE)
          .div(255.0)
          .expandDims(0)
      );
      const startTime = new Date().getTime();
      const res = await model.executeAsync(input);
      setDetectTime(new Date().getTime() - startTime);
      const { boxesData, scoresData, classesData, validCount } =
        await unboxingDetection(res);
      tf.dispose(res);
      tf.dispose(input);
      setDetectCount(validCount);
      drawDetections({
        canvas,
        ctx,
        boxesData,
        scoresData,
        classesData,
        validCount,
      });
      timerRef.current = setTimeout(drawImage);
    };
    drawImage();
    return () => {
      timerRef.current && window.clearTimeout(timerRef);
    };
  }, [timerRef, model, videoStream, setDetectTime]);

  return { model };
};

export const useVideo = (defaultFacing = CAMERA_DEFAULT_FACING) => {
  const [videoStream, setVideoStream] = useState();
  const [videoFacing, setVideoFacing] = useState(defaultFacing);
  useEffect(() => {
    let stream;
    const videoTag = document.getElementById("offscreen-video");
    videoTag.setAttribute("autoplay", "");
    videoTag.setAttribute("muted", "");
    videoTag.setAttribute("playsinline", "");
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: videoFacing,
          width: { min: 640 },
          height: { min: 640 },
        },
      });
      videoTag.srcObject = stream;
      requestAnimationFrame(() => videoTag.play());
      setVideoStream(stream);
    })();
    return () => {
      videoTag.srcObject = null;
      stream && stream.getTracks().forEach(t => t.stop());
    };
  }, [videoFacing]);
  const toggleVideoFacing = useCallback(
    () =>
      setVideoFacing(
        videoFacing === CAMERA_FACING.environment
          ? CAMERA_FACING.user
          : CAMERA_FACING.environment
      ),
    [videoFacing]
  );
  return { videoStream, videoFacing, toggleVideoFacing };
};
