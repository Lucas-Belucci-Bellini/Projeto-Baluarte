interface BarcodeDetectorOptions {
  formats?: readonly string[];
}

interface DetectedBarcode {
  rawValue?: string;
}

interface BarcodeDetector {
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

declare var BarcodeDetector: {
  new (options?: BarcodeDetectorOptions): BarcodeDetector;
};
