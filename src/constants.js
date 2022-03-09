export const WEIGHTS_PATH = window.cfg.weightPath;

export const CLASS_NAMES = window.cfg.classNames;
export const CLASS_COLORS = window.cfg.classColors;
export const FONT = "16px sans-serif";

export const MODEL_SIZE = window.cfg.imageSize || [320, 320];
export const DETECTION_THRESHOLD = window.cfg.detectionThreshold || 0.6;

export const CAMERA_FACING = {
  user: "user",
  environment: "environment",
};

export const CAMERA_DEFAULT_FACING = CAMERA_FACING.environment;
