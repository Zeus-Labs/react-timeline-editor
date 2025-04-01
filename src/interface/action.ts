/**
 * Basic parameters of an action
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
  /** Effect ID associated with the action */
  effectId: string;

  /** Whether the action is selected */
  selected?: boolean;
  /** Whether the action is resizable */
  flexible?: boolean;
  /** Whether the action is movable */
  movable?: boolean;
  /** Whether the action is disabled */
  disable?: boolean;
  /** Whether the action cannot be moved across tracks */
  blockCrossMovable?: boolean;

  /** Minimum start time constraint for the action */
  minStart?: number;
  /** Maximum end time constraint for the action */
  maxEnd?: number;
}

/**
 * Basic parameters of a timeline row
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
