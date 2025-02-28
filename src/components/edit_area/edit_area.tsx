import { DEFAULT_ADSORPTION_DISTANCE, DEFAULT_MOVE_GRID } from '@/interface/const';
import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { AutoSizer, Grid, GridCellRenderer, OnScrollParams } from 'react-virtualized';
import { TimelineAction, TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { EditData } from '../../interface/timeline';
import { prefix } from '../../utils/deal_class_prefix';
import { parserTimeToPixel, getScaleCountByPixel, parserTimeToTransform, parserTransformToTime } from '../../utils/deal_data';
import { DragLines } from './drag_lines';
import './edit_area.less';
import { EditRow } from './edit_row';
import { useDragLine } from './hooks/use_drag_line';

/**
 * Helper function to remove an action from a row
 * @param row The row to remove the action from
 * @param actionId The ID of the action to remove
 * @returns A new row with the action removed
 */
const removeActionFromRow = (row: TimelineRow, actionId: string): TimelineRow => {
  return {
    ...row,
    actions: row.actions.filter((action) => action.id !== actionId),
  };
};

/**
 * Helper function to add an action to a row
 * @param row The row to add the action to
 * @param action The action to add
 * @returns A new row with the action added
 */
const addActionToRow = (row: TimelineRow, action: TimelineAction): TimelineRow => {
  return {
    ...row,
    actions: [...row.actions, action],
  };
};

interface DragInfo {
  startX: number;
  startY: number;
}

interface ActionInfo {
  ghostAction: TimelineAction;
  action: TimelineAction;
  ghostRow: TimelineRow;
  row: TimelineRow;
  rowIndex: number;
  ghostRowIndex: number;
  dragInfo: DragInfo;
}

interface EditorAreaInternalState {
  tracks: TimelineRow[];
  actionInfo: ActionInfo | null;
  currentMouseRow: {
    row: TimelineRow;
    index: number;
  } | null;
}

export type EditAreaProps = CommonProp & {
  /** Distance scrolled from the left */
  scrollLeft: number;
  /** Distance scrolled from the top */
  scrollTop: number;
  /** Scroll callback for synchronizing scrolling */
  onScroll: (params: OnScrollParams) => void;
  /** Set editor data */
  setEditorData: (params: TimelineRow[]) => void;
  /** Set scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
};

/** Edit area ref data */
export interface EditAreaState {
  domRef: React.RefObject<HTMLDivElement>;
}

export const EditArea = React.forwardRef<EditAreaState, EditAreaProps>((props, ref) => {
  const {
    editorData,
    rowHeight,
    scaleWidth,
    maxScaleCount,
    scaleCount,
    startLeft,
    scrollLeft,
    scrollTop,
    scale,
    hideCursor,
    cursorTime,
    onScroll,
    dragLine,
    getAssistDragLineActionIds,
    onActionMoveEnd,
    onActionMoveStart,
    onActionMoving,
    onActionResizeEnd,
    onActionResizeStart,
    onActionResizing,
    setEditorData,
    gridSnap,
    scaleSplitCount,
    setScaleCount,
  } = props;
  const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLine();
  const editAreaRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<Grid>(null);
  const heightRef = useRef(-1);
  const isAdsorption = useRef(false);

  // Combined state for tracks and ghost action
  const [editorState, setEditorState] = useState<EditorAreaInternalState>({
    tracks: editorData,
    actionInfo: null,
    currentMouseRow: null,
  });

  // Destructure for easier access
  const { tracks, actionInfo } = editorState;

  useEffect(() => {
    setEditorState({ tracks: editorData, actionInfo: null, currentMouseRow: null });
  }, [editorData]);

  // ref data
  useImperativeHandle(ref, () => ({
    get domRef() {
      return editAreaRef;
    },
  }));

  const handleInitDragLine: EditData['onActionMoveStart'] = (data) => {
    if (dragLine) {
      const assistActionIds =
        getAssistDragLineActionIds &&
        getAssistDragLineActionIds({
          action: data.action,
          row: data.row,
          editorData,
        });
      const cursorLeft = parserTimeToPixel(cursorTime, { scaleWidth, scale, startLeft });
      const assistPositions = defaultGetAssistPosition({
        editorData,
        assistActionIds,
        action: data.action,
        row: data.row,
        scale,
        scaleWidth,
        startLeft,
        hideCursor,
        cursorLeft,
      });
      initDragLine({ assistPositions });
    }
  };

  const handleUpdateDragLine: EditData['onActionMoving'] = (data) => {
    if (dragLine) {
      const movePositions = defaultGetMovePosition({
        ...data,
        startLeft,
        scaleWidth,
        scale,
      });
      updateDragLine({ movePositions });
    }
  };

  const updateCurrentRow = useCallback((index: number, row?: TimelineRow) => {
    if (!row) return;

    // Simply update the current mouse row without any action validation
    setEditorState((prev) => ({
      ...prev,
      currentMouseRow: {
        row,
        index,
      },
    }));
  }, []);

  /** Calculate scale count */
  const handleScaleCount = (left: number, width: number) => {
    const curScaleCount = getScaleCountByPixel(left + width, {
      startLeft,
      scaleCount,
      scaleWidth,
    });
    if (curScaleCount !== scaleCount) setScaleCount(curScaleCount);
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // Use a function to get the latest state
      setEditorState((prev) => {
        const currentActionInfo = prev.actionInfo;
        const currentMouseRow = prev.currentMouseRow;

        // Early return if no action info
        if (!currentActionInfo) return prev;

        const { left, width } = parserTimeToTransform({ start: currentActionInfo.action.start, end: currentActionInfo.action.end }, { startLeft, scale, scaleWidth });

        let deltaX = e.clientX - currentActionInfo.dragInfo.startX;

        const gridSize = scaleWidth / scaleSplitCount;
        const adsorptionDistance = gridSnap ? Math.max((gridSize || DEFAULT_MOVE_GRID) / 2, DEFAULT_ADSORPTION_DISTANCE) : DEFAULT_ADSORPTION_DISTANCE;

        const grid = (gridSnap && gridSize) || DEFAULT_MOVE_GRID;
        const distance = isAdsorption.current ? adsorptionDistance : grid;

        // If movement is too small, don't update
        if (Math.abs(deltaX) < distance) return prev;

        const count = Math.floor(deltaX / distance);
        let curLeft = left + count * distance;

        // Control adsorption
        let adsorption = curLeft;
        let minDis = Number.MAX_SAFE_INTEGER;
        dragLineData.assistPositions.forEach((item) => {
          const dis = Math.abs(item - curLeft);
          if (dis < adsorptionDistance && dis < minDis) adsorption = item;
          const dis2 = Math.abs(item - (curLeft + width));
          if (dis2 < adsorptionDistance && dis2 < minDis) adsorption = item - width;
        });

        if (adsorption !== curLeft) {
          // Use adsorption data
          isAdsorption.current = true;
          curLeft = adsorption;
        } else {
          // Control grid
          if ((curLeft - startLeft) % grid !== 0) {
            curLeft = startLeft + grid * Math.round((curLeft - startLeft) / grid);
          }
          isAdsorption.current = false;
        }
        deltaX = deltaX % distance;

        // Control bounds
        const leftLimit = parserTimeToPixel(currentActionInfo.ghostAction.minStart || 0, {
          startLeft,
          scale,
          scaleWidth,
        });

        const rightLimit = Math.min(
          maxScaleCount * scaleWidth + startLeft, // Limit movement range based on maxScaleCount
          parserTimeToPixel(currentActionInfo.ghostAction.maxEnd || Number.MAX_VALUE, {
            startLeft,
            scale,
            scaleWidth,
          }),
        );

        if (curLeft < leftLimit) curLeft = leftLimit;
        else if (curLeft + width > rightLimit) curLeft = rightLimit - width;

        const { start, end } = parserTransformToTime({ left: curLeft, width }, { scaleWidth, scale, startLeft });
        const newAction = { ...currentActionInfo.action, start, end };

        // Add the action to the potential new row
        const row = addActionToRow(removeActionFromRow(editorData[currentMouseRow.index], newAction.id), newAction);

        const data = { action: currentActionInfo.action, row, start, end };

        // Check if the movement is valid
        if (onActionMoving) {
          const result = onActionMoving(data);
          if (result === false) return prev;
        }

        // Side effects outside of state update
        handleUpdateDragLine(data);
        handleScaleCount(left, width);

        // Return updated state
        return {
          ...prev,
          actionInfo: {
            ...currentActionInfo,
            ghostAction: {
              ...currentActionInfo.ghostAction,
              start,
              end,
            },
            ghostRow: currentMouseRow.row,
            rowIndex: currentMouseRow.index,
          },
        };
      });
    },
    [startLeft, scale, scaleWidth, onActionMoving, scaleSplitCount, gridSnap, dragLineData, maxScaleCount, editorData, handleUpdateDragLine],
  );

  const onDragStart = useCallback((action: TimelineAction, row: TimelineRow, clientX: number, clientY: number, rowIndex: number) => {
    setEditorState((prevState) => ({
      tracks: prevState.tracks,
      actionInfo: {
        ghostAction: {
          ...action,
          id: action.id + '-ghost',
        },
        action: {
          ...action,
        },
        ghostRow: row,
        row: row,
        rowIndex,
        ghostRowIndex: rowIndex,
        dragInfo: {
          startX: clientX,
          startY: clientY,
        },
      },
      currentMouseRow: {
        index: rowIndex,
        row,
      },
    }));
  }, []);

  const handleMouseUp = useCallback(
    (_: React.MouseEvent<HTMLDivElement>) => {
      if (!actionInfo) return;
      disposeDragLine();

      // Create a deep copy of the editor data to avoid direct mutations
      const updatedEditorData = [...editorData];

      // Find the original row and action
      const origRowIndex = actionInfo.ghostRowIndex;
      // Find the target row
      const targetRowIndex2 = actionInfo.rowIndex;

      // Create a new action object with updated times instead of mutating
      const updatedAction = {
        ...actionInfo.action,
        start: actionInfo.ghostAction.start,
        end: actionInfo.ghostAction.end,
      };

      // Remove the action from the original row
      updatedEditorData[origRowIndex] = removeActionFromRow(updatedEditorData[origRowIndex], actionInfo.action.id);

      // Add the action to the target row
      updatedEditorData[targetRowIndex2] = addActionToRow(updatedEditorData[targetRowIndex2], updatedAction);

      // Update the editor data
      setEditorData(updatedEditorData);

      // Execute callback
      if (onActionMoveEnd)
        onActionMoveEnd({
          action: updatedAction,
          row: actionInfo.ghostRow,
          start: updatedAction.start,
          end: updatedAction.end,
        });
    },
    [actionInfo, editorData, setEditorData, disposeDragLine, onActionMoveEnd],
  );

  /** Get the rendering content for each cell */
  const cellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
    const row = editorData[rowIndex]; // Row data

    if (!row) {
      return null; // Return null if row doesn't exist
    }

    return (
      <EditRow
        {...props}
        style={{
          ...style,
          backgroundPositionX: `0, ${startLeft}px`,
          backgroundSize: `${startLeft}px, ${scaleWidth}px`,
        }}
        areaRef={editAreaRef}
        key={key}
        rowHeight={row?.rowHeight || rowHeight}
        rowData={row}
        ghostAction={actionInfo?.rowIndex === rowIndex ? actionInfo?.ghostAction : undefined}
        onMouseEnter={(row) => updateCurrentRow(rowIndex, row)}
        onDragStart={(action: TimelineAction, row: TimelineRow, clientX: number, clientY: number) => {
          handleInitDragLine({ action, row });
          onDragStart(action, row, clientX, clientY, rowIndex);
          onActionMoveStart?.({ action, row });
        }}
        dragLineData={dragLineData}
        onActionMoveStart={(data) => {
          handleInitDragLine(data);
          return onActionMoveStart && onActionMoveStart(data);
        }}
        onActionResizeStart={(data) => {
          handleInitDragLine(data);

          return onActionResizeStart && onActionResizeStart(data);
        }}
        onActionMoving={(data) => {
          handleUpdateDragLine(data);
          return onActionMoving && onActionMoving(data);
        }}
        onActionResizing={(data) => {
          handleUpdateDragLine(data);
          return onActionResizing && onActionResizing(data);
        }}
        onActionResizeEnd={(data) => {
          disposeDragLine();
          return onActionResizeEnd && onActionResizeEnd(data);
        }}
        onActionMoveEnd={(data) => {
          disposeDragLine();
          return onActionMoveEnd && onActionMoveEnd(data);
        }}
      />
    );
  };

  useLayoutEffect(() => {
    gridRef.current?.scrollToPosition({ scrollTop, scrollLeft });
  }, [scrollTop, scrollLeft]);

  useEffect(() => {
    gridRef.current?.recomputeGridSize();
  }, [editorData]);

  return (
    <div ref={editAreaRef} className={prefix('edit-area')} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp}>
      <AutoSizer>
        {({ width, height }) => {
          // Get total height
          let totalHeight = 0;
          // Height list
          const heights = tracks.map((row) => {
            const itemHeight = row.rowHeight || rowHeight;
            totalHeight += itemHeight;
            return itemHeight;
          });
          if (totalHeight < height) {
            heights.push(height - totalHeight);
            if (heightRef.current !== height && heightRef.current >= 0) {
              setTimeout(() =>
                gridRef.current?.recomputeGridSize({
                  rowIndex: heights.length - 1,
                }),
              );
            }
          }
          heightRef.current = height;

          return (
            <Grid
              columnCount={1}
              rowCount={heights.length}
              ref={gridRef}
              cellRenderer={cellRenderer}
              columnWidth={Math.max(scaleCount * scaleWidth + startLeft, width)}
              width={width}
              height={height}
              rowHeight={({ index }) => heights[index] || rowHeight}
              overscanRowCount={10}
              overscanColumnCount={0}
              onScroll={(param) => {
                onScroll(param);
              }}
            />
          );
        }}
      </AutoSizer>
      {dragLine && <DragLines scrollLeft={scrollLeft} {...dragLineData} />}
    </div>
  );
});
