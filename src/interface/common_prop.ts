import { EditData } from './timeline';

/** Component common parameters */
export interface CommonProp extends EditData {
  /** Number of scale marks */
  scaleCount: number;
  /** Set number of scale marks */
  setScaleCount: (scaleCount: number) => void;
  /** Cursor time */
  cursorTime: number;
  /** Current timeline width */
  timelineWidth: number;
}
