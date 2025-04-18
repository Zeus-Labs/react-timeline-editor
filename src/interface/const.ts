export const PREFIX = `timeline-editor`;

/** Initial cursor time */
export const START_CURSOR_TIME = 0;
/** Default scale */
export const DEFAULT_SCALE = 1;
/** Default scale split count */
export const DEFAULT_SCALE_SPLIT_COUNT = 10;

/** Default scale display width */
export const DEFAULT_SCALE_WIDTH = 160;
/** Default left margin for scale */
export const DEFAULT_START_LEFT = 20;
/** Default minimum pixel movement */
export const DEFAULT_MOVE_GRID = 1;
/** Default adsorption pixel distance */
export const DEFAULT_ADSORPTION_DISTANCE = 8;
/** Default action row height */
export const DEFAULT_ROW_HEIGHT = 32;

/** Minimum scale count */
export const MIN_SCALE_COUNT = 20;
/** Number of scales to add each time */
export const ADD_SCALE_COUNT = 5;

/** Error messages */
export const ERROR = {
  START_TIME_LESS_THEN_ZERO: 'Action start time cannot be less than 0!',
  END_TIME_LESS_THEN_START_TIME: 'Action end time cannot be less then start time!',
};
