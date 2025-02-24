import React, { ReactNode } from 'react';
import { OnScrollParams } from 'react-virtualized';
import { ITimelineEngine } from '..';
import { Emitter } from '../engine/emitter';
import { EventTypes } from '../engine/events';
import { TimelineAction, TimelineRow } from './action';
import { TimelineEffect } from './effect';
export * from './action';
export * from './effect';

export interface EditData {
  /**
   * @description Timeline editing data
   */
  editorData: TimelineRow[];
  /**
   * @description Timeline action effects map
   */
  effects: Record<string, TimelineEffect>;
  /**
   * @description Single scale mark category (>0)
   * @default 1
   */
  scale?: number;
  /**
   * @description Minimum number of scale marks (>=1)
   * @default 20
   */
  minScaleCount?: number;
  /**
   * @description Maximum number of scale marks (>=minScaleCount)
   * @default Infinity
   */
  maxScaleCount?: number;
  /**
   * @description Number of subdivisions per scale mark (>0 integer)
   * @default 10
   */
  scaleSplitCount?: number;
  /**
   * @description Display width of a single scale mark (>0, unit: px)
   * @default 160
   */
  scaleWidth?: number;
  /**
   * @description Distance from the left edge to the start of scale marks (>=0, unit: px)
   * @default 20
   */
  startLeft?: number;
  /**
   * @description Default height for each editing row (>0, unit: px)
   * @default 32
   */
  rowHeight?: number;
  /**
   * @description Enable grid movement snapping
   * @default false
   */
  gridSnap?: boolean;
  /**
   * @description Enable drag guide line snapping
   * @default false
   */
  dragLine?: boolean;
  enableDragBetweenTracks?: boolean;
  /**
   * @description Hide cursor
   * @default false
   */
  hideCursor?: boolean;
  /**
   * @description Disable dragging for all action areas
   * @default false
   */
  disableDrag?: boolean;
  /**
   * @description Timeline engine, uses built-in engine if not provided
   */
  engine?: ITimelineEngine;
  /**
   * @description Custom action area renderer
   */
  getActionRender?: (action: TimelineAction, row: TimelineRow) => ReactNode;
  /**
   * @description Custom scale renderer
   */
  getScaleRender?: (scale: number) => ReactNode;
  /**
   * @description Callback when action movement starts
   */
  onActionMoveStart?: (params: { action: TimelineAction; row: TimelineRow }) => void;
  /**
   * @description Movement callback (return false to prevent movement)
   */
  onActionMoving?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number }) => void | boolean;
  /**
   * @description Movement end callback (return false to prevent onChange trigger)
   */
  onActionMoveEnd?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number }) => void;
  /**
   * @description Callback when size change starts
   */
  onActionResizeStart?: (params: { action: TimelineAction; row: TimelineRow; dir: 'right' | 'left' }) => void;
  /**
   * @description Size change callback (return false to prevent change)
   */
  onActionResizing?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number; dir: 'right' | 'left' }) => void | boolean;
  /**
   * @description Size change end callback (return false to prevent onChange trigger)
   */
  onActionResizeEnd?: (params: { action: TimelineAction; row: TimelineRow; start: number; end: number; dir: 'right' | 'left' }) => void;
  /**
   * @description Row click callback
   */
  onClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Action click callback
   */
  onClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Action click callback (not executed when drag is triggered)
   */
  onClickActionOnly?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Row double click callback
   */
  onDoubleClickRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Action double click callback
   */
  onDoubleClickAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Row right click callback
   */
  onContextMenuRow?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Action right click callback
   */
  onContextMenuAction?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    param: {
      action: TimelineAction;
      row: TimelineRow;
      time: number;
    },
  ) => void;
  /**
   * @description Get list of action IDs for guide line hints, calculated at move/resize start, defaults to all actions except current
   */
  getAssistDragLineActionIds?: (params: { action: TimelineAction; editorData: TimelineRow[]; row: TimelineRow }) => string[];
  /**
   * @description Cursor drag start event
   */
  onCursorDragStart?: (time: number) => void;
  /**
   * @description Cursor drag end event
   */
  onCursorDragEnd?: (time: number) => void;
  /**
   * @description Cursor drag event
   */
  onCursorDrag?: (time: number) => void;
  /**
   * @description Time area click event, return false to prevent time setting
   */
  onClickTimeArea?: (time: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => boolean | undefined;
}

export interface TimelineState {
  /** DOM node */
  target: HTMLElement;
  /** Runtime listener */
  listener: Emitter<EventTypes>;
  /** Whether currently playing */
  isPlaying: boolean;
  /** Whether currently paused */
  isPaused: boolean;
  /** Set current playback time */
  setTime: (time: number) => void;
  /** Get current playback time */
  getTime: () => number;
  /** Set playback rate */
  setPlayRate: (rate: number) => void;
  /** Set playback rate */
  getPlayRate: () => number;
  /** Re-render current time */
  reRender: () => void;
  /** Play */
  play: (param: {
    /** Default runs from start to end, takes priority over autoEnd */
    toTime?: number;
    /** Whether to automatically end after playback completes */
    autoEnd?: boolean;
    /** List of action IDs to run, runs all if not provided */
    runActionIds?: string[];
  }) => boolean;
  /** Pause */
  pause: () => void;
  /** Set scroll left */
  setScrollLeft: (val: number) => void;
  /** Set scroll top */
  setScrollTop: (val: number) => void;
}

export interface TimelineEditor extends EditData {
  /**
   * @description Editor area scroll distance from top (please use ref.setScrollTop instead)
   * @deprecated
   */
  scrollTop?: number;
  /**
   * @description Editor area scroll callback (used to control synchronization with editing row scrolling)
   */
  onScroll?: (params: OnScrollParams) => void;
  /**
   * @description Whether to enable auto-scrolling during drag
   * @default false
   */
  autoScroll?: boolean;
  /**
   * @description Custom timeline styles
   */
  style?: React.CSSProperties;
  /**
   * @description Whether to auto re-render (update tick when data changes or cursor time changes)
   * @default true
   */
  autoReRender?: boolean;
  /**
   * @description Data change callback, triggered after action end changes data (returning false prevents automatic engine sync to reduce performance overhead)
   */
  onChange?: (editorData: TimelineRow[]) => void | boolean;
}
