/**
 * Basic parameters for actions
 * @export
 * @interface TimelineAction
 */
export interface TimelineAction {
  /** Action ID */
  id: string;
  /** Action start time */
  start: number;
  /** Action end time */
  end: number;
  /** Effect ID corresponding to the action */
  effectId: string;

  /** Whether the action is selected */
  selected?: boolean;
  /** Whether the action can be resized */
  flexible?: boolean;
  /** Whether the action can be moved */
  movable?: boolean;
  /** Whether the action is disabled */
  disable?: boolean;

  /** Minimum start time constraint for the action */
  minStart?: number;
  /** Maximum end time constraint for the action */
  maxEnd?: number;
}

/**
 * Basic parameters for timeline row
 * @export
 * @interface TimelineRow
 */
export interface TimelineRow {
  /** Row ID */
  id: string;
  /** List of actions in the row */
  actions: TimelineAction[];
  /** Custom row height */
  rowHeight?: number;
  /** Whether the row is selected */
  selected?: boolean;
  /** Additional class names for the row */
  classNames?: string[];
}
