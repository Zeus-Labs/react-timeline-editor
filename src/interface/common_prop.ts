import { EditData } from './timeline';

export interface CommonProp extends EditData {
  /** Number of scale marks */
  scaleCount: number;
  /** Set the number of scale marks */
  setScaleCount: (scaleCount: number) => void;
  /** Cursor time */
  cursorTime: number;
  /** Current timeline width */
  timelineWidth: number;
}
