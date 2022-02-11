# Mask detector

This project detects a human with/without mask on a live streaming video. It uses [yolov5](https://github.com/ultralytics/yolov5) to train a model and to detect masks. And this repo is modifed from [tfjs-yolov5-example](https://github.com/zldrobit/tfjs-yolov5-example).

## Pre-trained model.

A pre-trianed model can be found at [public folder](public/modeln/). It trained with the [yolo-try-mask](https://www.kaggle.com/ddrrww/yolotrymask).

If you interest to improve it, you can contact [John Hu](mailto:im@john.hu) to get the weight file.
Of course, suggestions or improvements are welcome.

## Performance and Configs

To have better performance at mobile device, we use 320px x 320px as the size for detection. The model is trained from smallest config of YOLOv5. We know it may reduce P or R value.

Image size: 320x320

Classes:
* 0: with mask
* 1: without mask

## Development

```shell
yarn
yarn start
```
