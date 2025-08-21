import '@testing-library/jest-dom'
import 'jest-extended'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Firebase
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
  updateProfile: jest.fn(),
}))

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn(),
}))

// Mock MediaPipe
jest.mock('@mediapipe/face_detection', () => ({
  FaceDetection: jest.fn().mockImplementation(() => ({
    setOptions: jest.fn(),
    onResults: jest.fn(),
    send: jest.fn(),
  })),
}))

// Mock OpenCV
global.cv = {
  imread: jest.fn(),
  imshow: jest.fn(),
  waitKey: jest.fn(),
  destroyAllWindows: jest.fn(),
  Mat: jest.fn(),
  Rect: jest.fn(),
  Point: jest.fn(),
  Scalar: jest.fn(),
  circle: jest.fn(),
  rectangle: jest.fn(),
  putText: jest.fn(),
  cvtColor: jest.fn(),
  GaussianBlur: jest.fn(),
  Canny: jest.fn(),
  findContours: jest.fn(),
  contourArea: jest.fn(),
  boundingRect: jest.fn(),
  moments: jest.fn(),
  arcLength: jest.fn(),
  approxPolyDP: jest.fn(),
  minAreaRect: jest.fn(),
  boxPoints: jest.fn(),
  polylines: jest.fn(),
  fillPoly: jest.fn(),
  bitwise_and: jest.fn(),
  bitwise_or: jest.fn(),
  bitwise_not: jest.fn(),
  bitwise_xor: jest.fn(),
  add: jest.fn(),
  subtract: jest.fn(),
  multiply: jest.fn(),
  divide: jest.fn(),
  threshold: jest.fn(),
  adaptiveThreshold: jest.fn(),
  morphologyEx: jest.fn(),
  getStructuringElement: jest.fn(),
  dilate: jest.fn(),
  erode: jest.fn(),
  resize: jest.fn(),
  warpAffine: jest.fn(),
  getRotationMatrix2D: jest.fn(),
  warpPerspective: jest.fn(),
  getPerspectiveTransform: jest.fn(),
  perspectiveTransform: jest.fn(),
  matchTemplate: jest.fn(),
  minMaxLoc: jest.fn(),
  normalize: jest.fn(),
  mean: jest.fn(),
  meanStdDev: jest.fn(),
  sum: jest.fn(),
  countNonZero: jest.fn(),
  connectedComponents: jest.fn(),
  connectedComponentsWithStats: jest.fn(),
  distanceTransform: jest.fn(),
  watershed: jest.fn(),
  grabCut: jest.fn(),
  pyrDown: jest.fn(),
  pyrUp: jest.fn(),
  buildPyramid: jest.fn(),
  calcHist: jest.fn(),
  compareHist: jest.fn(),
  equalizeHist: jest.fn(),
  CLAHE: jest.fn(),
  calcBackProject: jest.fn(),
  CamShift: jest.fn(),
  meanShift: jest.fn(),
  TermCriteria: jest.fn(),
  goodFeaturesToTrack: jest.fn(),
  cornerHarris: jest.fn(),
  cornerSubPix: jest.fn(),
  calcOpticalFlowPyrLK: jest.fn(),
  calcOpticalFlowFarneback: jest.fn(),
  estimateRigidTransform: jest.fn(),
  findHomography: jest.fn(),
  solvePnP: jest.fn(),
  solvePnPRansac: jest.fn(),
  calibrateCamera: jest.fn(),
  undistort: jest.fn(),
  getOptimalNewCameraMatrix: jest.fn(),
  initUndistortRectifyMap: jest.fn(),
  remap: jest.fn(),
  stereoCalibrate: jest.fn(),
  stereoRectify: jest.fn(),
  computeCorrespondEpilines: jest.fn(),
  triangulatePoints: jest.fn(),
  reprojectImageTo3D: jest.fn(),
  filterSpeckles: jest.fn(),
  getValidDisparityROI: jest.fn(),
  validateDisparity: jest.fn(),
  COLOR_BGR2GRAY: 6,
  COLOR_BGR2HSV: 40,
  COLOR_HSV2BGR: 54,
  COLOR_BGR2RGB: 4,
  COLOR_RGB2BGR: 4,
  COLOR_BGR2LAB: 44,
  COLOR_LAB2BGR: 56,
  COLOR_BGR2YUV: 82,
  COLOR_YUV2BGR: 84,
  COLOR_BGR2XYZ: 32,
  COLOR_XYZ2BGR: 34,
  COLOR_BGR2HLS: 52,
  COLOR_HLS2BGR: 60,
  COLOR_BGR2LUV: 50,
  COLOR_LUV2BGR: 58,
  COLOR_BGR2YCrCb: 36,
  COLOR_YCrCb2BGR: 38,
  THRESH_BINARY: 0,
  THRESH_BINARY_INV: 1,
  THRESH_TRUNC: 2,
  THRESH_TOZERO: 3,
  THRESH_TOZERO_INV: 4,
  THRESH_MASK: 7,
  THRESH_OTSU: 8,
  THRESH_TRIANGLE: 16,
  ADAPTIVE_THRESH_MEAN_C: 0,
  ADAPTIVE_THRESH_GAUSSIAN_C: 1,
  MORPH_ERODE: 0,
  MORPH_DILATE: 1,
  MORPH_OPEN: 2,
  MORPH_CLOSE: 3,
  MORPH_GRADIENT: 4,
  MORPH_TOPHAT: 5,
  MORPH_BLACKHAT: 6,
  MORPH_HITMISS: 7,
  MORPH_RECT: 0,
  MORPH_CROSS: 1,
  MORPH_ELLIPSE: 2,
  INTER_NEAREST: 0,
  INTER_LINEAR: 1,
  INTER_CUBIC: 2,
  INTER_AREA: 3,
  INTER_LANCZOS4: 4,
  INTER_LINEAR_EXACT: 5,
  INTER_NEAREST_EXACT: 6,
  INTER_MAX: 7,
  WARP_INVERSE_MAP: 16,
  BORDER_CONSTANT: 0,
  BORDER_REPLICATE: 1,
  BORDER_REFLECT: 2,
  BORDER_WRAP: 3,
  BORDER_TRANSPARENT: 4,
  BORDER_REFLECT_101: 4,
  BORDER_DEFAULT: 4,
  BORDER_ISOLATED: 16,
  TM_SQDIFF: 0,
  TM_SQDIFF_NORMED: 1,
  TM_CCORR: 2,
  TM_CCORR_NORMED: 3,
  TM_CCOEFF: 4,
  TM_CCOEFF_NORMED: 5,
  RETR_EXTERNAL: 0,
  RETR_LIST: 1,
  RETR_CCOMP: 2,
  RETR_TREE: 3,
  RETR_FLOODFILL: 4,
  CHAIN_APPROX_NONE: 1,
  CHAIN_APPROX_SIMPLE: 2,
  CHAIN_APPROX_TC89_KCOS: 3,
  CHAIN_APPROX_TC89_L1: 4,
  FONT_HERSHEY_SIMPLEX: 0,
  FONT_HERSHEY_PLAIN: 1,
  FONT_HERSHEY_DUPLEX: 2,
  FONT_HERSHEY_COMPLEX: 3,
  FONT_HERSHEY_TRIPLEX: 4,
  FONT_HERSHEY_COMPLEX_SMALL: 5,
  FONT_HERSHEY_SCRIPT_SIMPLEX: 6,
  FONT_HERSHEY_SCRIPT_COMPLEX: 7,
  FONT_ITALIC: 16,
  LINE_8: 8,
  LINE_4: 4,
  LINE_AA: 16,
  FILLED: -1,
  CV_8UC1: 0,
  CV_8UC3: 16,
  CV_8UC4: 24,
  CV_32FC1: 5,
  CV_32FC3: 21,
  CV_32FC4: 29,
  CV_64FC1: 6,
  CV_64FC3: 22,
  CV_64FC4: 30,
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
}

// Mock getComputedStyle
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} 