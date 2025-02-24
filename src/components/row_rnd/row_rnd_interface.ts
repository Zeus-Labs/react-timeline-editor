import { DragEvent, ResizeEvent } from '@interactjs/types/index';

type EventData = {
  lastLeft: number;
  left: number;
  lastWidth: number;
  width: number;
};

type EventDragData = EventData & {
  top: number;
  lastTop: number;
};

export type RndDragStartCallback = () => void;
export type RndDragCallback = (data: EventDragData, scrollDelta?: number) => boolean | void;
export type RndDragEndCallback = (data: Pick<EventDragData, 'left' | 'width' | 'top'>) => void;

export type Direction = 'left' | 'right';
export type RndResizeStartCallback = (dir: Direction) => void;
export type RndResizeCallback = (dir: Direction, data: EventData) => boolean | void;
export type RndResizeEndCallback = (dir: Direction, data: Pick<EventData, 'left' | 'width'>) => void;

export interface RowRndApi {
  updateWidth: (size: number) => void;
  updateLeft: (left: number) => void;
  updateTop: (top: number) => void;
  getLeft: () => number;
  getTop: () => number;
  getWidth: () => number;
}

export interface RowRndProps {
  width?: number;
  left?: number;
  grid?: number;
  start?: number;
  bounds?: { left: number; right: number };
  edges?: { left: boolean | string; right: boolean | string };

  onResizeStart?: RndResizeStartCallback;
  onResize?: RndResizeCallback;
  onResizeEnd?: RndResizeEndCallback;
  onDragStart?: RndDragStartCallback;
  onDrag?: RndDragCallback;
  onDragEnd?: RndDragEndCallback;
  // Auto-scrolling is enabled when both parentRef and deltaScrollLeft are provided
  parentRef?: React.MutableRefObject<HTMLDivElement>;
  deltaScrollLeft?: (delta: number) => void;

  children?: React.ReactNode;

  enableResizing?: boolean;
  enableDragging?: boolean;
  enableDragBetweenTracks?: boolean;
  adsorptionPositions?: number[];
  adsorptionDistance?: number;
}
