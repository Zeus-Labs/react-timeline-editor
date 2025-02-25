import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import { TimelineAction, TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID } from '../../interface/const';
import { prefix } from '../../utils/deal_class_prefix';
import { getScaleCountByPixel, parserTimeToPixel, parserTimeToTransform, parserTransformToTime } from '../../utils/deal_data';
import { RowDnd } from '../row_rnd/row_rnd';
import { RndDragCallback, RndDragEndCallback, RndDragStartCallback, RndResizeCallback, RndResizeEndCallback, RndResizeStartCallback, RowRndApi } from '../row_rnd/row_rnd_interface';
import { DragLineData } from './drag_lines';
import './edit_action.less';
import { findRowIndexByPosition, getRowYPosition } from '../../utils/row_utils';

export type EditActionProps = CommonProp & {
  row: TimelineRow;
  action: TimelineAction;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  handleTime: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => number;
  areaRef: React.MutableRefObject<HTMLDivElement>;
  enableDragBetweenTracks?: boolean;
  /** Set scroll left */
  deltaScrollLeft?: (delta: number) => void;
};

export const EditAction: FC<EditActionProps> = ({
  editorData,
  row,
  action,
  effects,
  rowHeight,
  scale,
  scaleWidth,
  scaleSplitCount,
  startLeft,
  gridSnap,
  disableDrag,
  enableDragBetweenTracks = false,

  scaleCount,
  maxScaleCount,
  setScaleCount,
  onActionMoveStart,
  onActionMoving,
  onActionMoveEnd,
  onActionResizeStart,
  onActionResizeEnd,
  onActionResizing,

  dragLineData,
  setEditorData,
  onClickAction,
  onClickActionOnly,
  onDoubleClickAction,
  onContextMenuAction,
  getActionRender,
  handleTime,
  areaRef,
  deltaScrollLeft,
}) => {
  const rowRnd = useRef<RowRndApi>();
  const isDragWhenClick = useRef(false);
  const { id, maxEnd, minStart, end, start, selected, flexible = true, movable = true, effectId } = action;
  const [isDragging, setIsDragging] = useState(false);

  // Get max/min pixel range
  const leftLimit = parserTimeToPixel(minStart || 0, {
    startLeft,
    scale,
    scaleWidth,
  });
  const rightLimit = Math.min(
    maxScaleCount * scaleWidth + startLeft, // Limit movement range based on maxScaleCount
    parserTimeToPixel(maxEnd || Number.MAX_VALUE, {
      startLeft,
      scale,
      scaleWidth,
    }),
  );

  // Initialize action coordinate data
  const [transform, setTransform] = useState(() => {
    return parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth });
  });

  useLayoutEffect(() => {
    setTransform(parserTimeToTransform({ start, end }, { startLeft, scale, scaleWidth }));
  }, [end, start, startLeft, scaleWidth, scale]);

  // Configure drag grid alignment properties
  const gridSize = scaleWidth / scaleSplitCount;

  // Action name
  const classNames = ['action'];
  if (movable) classNames.push('action-movable');
  if (selected) classNames.push('action-selected');
  if (flexible) classNames.push('action-flexible');
  if (effects[effectId]) classNames.push(`action-effect-${effectId}`);
  if (isDragging) classNames.push('action-dragging');

  /** Calculate scale count */
  const handleScaleCount = (left: number, width: number) => {
    const curScaleCount = getScaleCountByPixel(left + width, {
      startLeft,
      scaleCount,
      scaleWidth,
    });
    if (curScaleCount !== scaleCount) setScaleCount(curScaleCount);
  };

  //#region [rgba(100,120,156,0.08)] callbacks
  const handleDragStart: RndDragStartCallback = () => {
    setIsDragging(true);
    onActionMoveStart && onActionMoveStart({ action, row });
  };

  const handleDrag: RndDragCallback = ({ left, width, top }) => {
    isDragWhenClick.current = true;

    if (enableDragBetweenTracks && top !== 0) {
      // When dragging between tracks, we just update the visual position
      // The actual data update happens on drag end
      if (onActionMoving) {
        const { start, end } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });
        const result = onActionMoving({ action, row, start, end });
        if (result === false) return false;
      }
      setTransform({ left, width });
      handleScaleCount(left, width);
      return;
    }

    // Normal horizontal drag within the same track
    if (onActionMoving) {
      const { start, end } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });
      const result = onActionMoving({ action, row, start, end });
      if (result === false) return false;
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleDragEnd: RndDragEndCallback = ({ left, width, top }) => {
    setIsDragging(false);
    
    // Calculate time
    const { start: newStart, end: newEnd } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });
    
    if (enableDragBetweenTracks && top !== 0) {
      // Find the target row based on the vertical position
      const targetRowIndex = findRowIndexByPosition(top, editorData, rowHeight);
      const targetRow = editorData[targetRowIndex];
      
      if (targetRow && targetRow.id !== row.id) {
        // Remove action from source row
        const sourceRow = editorData.find(r => r.id === row.id);
        sourceRow.actions = sourceRow.actions.filter(a => a.id !== action.id);
        
        // Add action to target row with updated time values
        const updatedAction = {
          ...action,
          start: newStart,
          end: newEnd
        };
        
        targetRow.actions.push(updatedAction);
        
        // Update editor data
        setEditorData([...editorData]);
        
        // Execute callback
        if (onActionMoveEnd) {
          onActionMoveEnd({ 
            action: updatedAction, 
            row: targetRow, 
            start: newStart, 
            end: newEnd 
          });
        }
        
        return;
      }
    }
    
    // Normal drag end within the same row
    const rowItem = editorData.find((item) => item.id === row.id);
    const actionItem = rowItem.actions.find((item) => item.id === id);
    actionItem.start = newStart;
    actionItem.end = newEnd;
    setEditorData([...editorData]);

    // Execute callback
    if (onActionMoveEnd) {
      onActionMoveEnd({ 
        action: actionItem, 
        row: rowItem, 
        start: newStart, 
        end: newEnd 
      });
    }
  };

  const handleResizeStart: RndResizeStartCallback = (dir) => {
    onActionResizeStart && onActionResizeStart({ action, row, dir });
  };

  const handleResizing: RndResizeCallback = (dir, { left, width }) => {
    isDragWhenClick.current = true;
    if (onActionResizing) {
      const { start, end } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });
      const result = onActionResizing({ action, row, start, end, dir });
      if (result === false) return false;
    }
    setTransform({ left, width });
    handleScaleCount(left, width);
  };

  const handleResizeEnd: RndResizeEndCallback = (dir, { left, width }) => {
    // Calculate time
    const { start, end } = parserTransformToTime({ left, width }, { scaleWidth, scale, startLeft });

    // Set data
    const rowItem = editorData.find((item) => item.id === row.id);
    const action = rowItem.actions.find((item) => item.id === id);
    action.start = start;
    action.end = end;
    setEditorData(editorData);

    // Trigger callback
    if (onActionResizeEnd) onActionResizeEnd({ action, row, start, end, dir });
  };
  //#endregion

  const nowAction = {
    ...action,
    ...parserTransformToTime({ left: transform.left, width: transform.width }, { startLeft, scaleWidth, scale }),
  };

  const nowRow: TimelineRow = {
    ...row,
    actions: [...row.actions],
  };
  if (row.actions.includes(action)) {
    nowRow.actions[row.actions.indexOf(action)] = nowAction;
  }

  return (
    <RowDnd
      ref={rowRnd}
      parentRef={areaRef}
      start={startLeft}
      left={transform.left}
      width={transform.width}
      grid={(gridSnap && gridSize) || DEFAULT_MOVE_GRID}
      adsorptionDistance={gridSnap ? Math.max((gridSize || DEFAULT_MOVE_GRID) / 2, DEFAULT_ADSORPTION_DISTANCE) : DEFAULT_ADSORPTION_DISTANCE}
      adsorptionPositions={dragLineData.assistPositions}
      bounds={{
        left: leftLimit,
        right: rightLimit,
      }}
      edges={{
        left: !disableDrag && flexible && `.${prefix('action-left-stretch')}`,
        right: !disableDrag && flexible && `.${prefix('action-right-stretch')}`,
      }}
      enableDragging={!disableDrag && movable}
      enableResizing={!disableDrag && flexible}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onResizeStart={handleResizeStart}
      onResize={handleResizing}
      onResizeEnd={handleResizeEnd}
      deltaScrollLeft={deltaScrollLeft}
      enableDragBetweenTracks={enableDragBetweenTracks}
    >
      <div
        onMouseDown={() => {
          isDragWhenClick.current = false;
        }}
        onClick={(e) => {
          let time: number;
          if (onClickAction) {
            time = handleTime(e);
            onClickAction(e, { row, action, time: time });
          }
          if (!isDragWhenClick.current && onClickActionOnly) {
            if (!time) time = handleTime(e);
            onClickActionOnly(e, { row, action, time: time });
          }
        }}
        onDoubleClick={(e) => {
          if (onDoubleClickAction) {
            const time = handleTime(e);
            onDoubleClickAction(e, { row, action, time: time });
          }
        }}
        onContextMenu={(e) => {
          if (onContextMenuAction) {
            const time = handleTime(e);
            onContextMenuAction(e, { row, action, time: time });
          }
        }}
        className={prefix((classNames || []).join(' '))}
        style={{ 
          height: rowHeight,
          cursor: isDragging ? 'grabbing' : 'grab',
          opacity: isDragging ? 0.8 : 1,
          zIndex: isDragging ? 1000 : 1
        }}
        data-action-id={action.id}
        data-row-id={row.id}
      >
        {getActionRender && getActionRender(nowAction, nowRow)}
        {flexible && <div className={prefix('action-left-stretch')} />}
        {flexible && <div className={prefix('action-right-stretch')} />}
      </div>
    </RowDnd>
  );
};
