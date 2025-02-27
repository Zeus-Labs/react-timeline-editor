import { DEFAULT_MOVE_GRID } from '@/interface/const';
import React, { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { AutoSizer, Grid, GridCellRenderer, OnScrollParams } from 'react-virtualized';
import { TimelineAction, TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { EditData } from '../../interface/timeline';
import { prefix } from '../../utils/deal_class_prefix';
import { parserTimeToPixel, parserTimeToTransform, parserTransformToTime } from '../../utils/deal_data';
import { DragLines } from './drag_lines';
import './edit_area.less';
import { EditRow } from './edit_row';
import { useDragLine } from './hooks/use_drag_line';

interface DragInfo {
  startX: number;
  startY: number;
  rightLimit: number;
  leftLimit: number;
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
  domRef: React.MutableRefObject<HTMLDivElement>;
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
  } = props;
  const { dragLineData, initDragLine, updateDragLine, disposeDragLine, defaultGetAssistPosition, defaultGetMovePosition } = useDragLine();
  const editAreaRef = useRef<HTMLDivElement>();
  const gridRef = useRef<Grid>();
  const heightRef = useRef(-1);

  // Combined state for tracks and ghost action
  const [editorState, setEditorState] = useState<{
    tracks: TimelineRow[];
    ghostAction: {
      action: TimelineAction;
      origAction: TimelineAction;
      row: TimelineRow;
      origRow: TimelineRow;
      rowIndex: number;
      origRowIndex: number;
      dragInfo: DragInfo;
    } | null;
  }>({
    tracks: editorData,
    ghostAction: null,
  });

  // Destructure for easier access
  const { tracks, ghostAction } = editorState;

  useEffect(() => {
    setEditorState({ tracks: editorData, ghostAction: null });
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

  const updateCurrentRow = useCallback(
    (rowIndex: number, row?: TimelineRow) => {
      if (!ghostAction) return;

      // Create a copy of the tracks to modify
      const newTracks = [...tracks];

      // Remove ghost action from its original row
      const sourceRow = newTracks[ghostAction.rowIndex];
      newTracks[ghostAction.rowIndex] = {
        ...sourceRow,
        actions: sourceRow.actions.filter((a) => a.id !== ghostAction.action.id),
      };

      // If a target row is provided and it's different from the source row, add the ghost action to it
      if (row && row.id !== ghostAction.row.id) {
        const targetRowIndex = rowIndex;
        newTracks[targetRowIndex] = {
          ...newTracks[targetRowIndex],
          actions: [...newTracks[targetRowIndex].actions, ghostAction.action],
        };

        const start = ghostAction.action.start;
        const end = ghostAction.action.end;
        const data = { action: ghostAction.origAction, row: newTracks[targetRowIndex], start, end };

        // Check if the movement is valid
        if (onActionMoving) {
          // TODO: set the correct original row + action in case of movement between rows
          const result = onActionMoving(data);
          if (result === false) return;
        }

        // Update the editor state with new tracks and updated ghost action
        setEditorState({
          tracks: newTracks,
          ghostAction: {
            ...ghostAction,
            row,
            rowIndex,
          },
        });
        return;
      }

      // Just update the tracks if we're not changing rows
      setEditorState({
        tracks: newTracks,
        ghostAction,
      });
    },
    [ghostAction, tracks, onActionMoving],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ghostAction) return;

      const { left, width } = parserTimeToTransform({ start: ghostAction.origAction.start, end: ghostAction.origAction.end }, { startLeft, scale, scaleWidth });

      const deltaX = e.clientX - ghostAction.dragInfo.startX;

      // TODO: snap the value
      const distance = DEFAULT_MOVE_GRID;

      const count = Math.floor(deltaX / distance);

      let curLeft = left + count * distance;

      // Control bounds
      const leftLimit = ghostAction.dragInfo.leftLimit;
      const rightLimit = ghostAction.dragInfo.rightLimit;

      if (curLeft < leftLimit) curLeft = leftLimit;
      else if (curLeft + width > rightLimit) curLeft = rightLimit - width;

      const { start, end } = parserTransformToTime({ left: curLeft, width }, { scaleWidth, scale, startLeft });

      const data = { action: ghostAction.origAction, row: ghostAction.row, start, end };
      handleUpdateDragLine(data);

      // Check if the movement is valid
      if (onActionMoving) {
        // TODO: set the correct original row + action in case of movement between rows
        const result = onActionMoving(data);
        if (result === false) return;
      }

      setEditorState((prev) => ({
        ...prev,
        ghostAction: {
          ...ghostAction,
          action: {
            ...ghostAction.action,
            start,
            end,
          },
        },
      }));

      //handleScaleCount(left, width);
    },
    [ghostAction, startLeft, scale, scaleWidth],
  );

  const onDragStart = useCallback((action: TimelineAction, row: TimelineRow, clientX: number, clientY: number, rowIndex: number) => {
    const leftLimit = parserTimeToPixel(action.minStart || 0, {
      startLeft,
      scale,
      scaleWidth,
    });

    const rightLimit = Math.min(
      maxScaleCount * scaleWidth + startLeft, // Limit movement range based on maxScaleCount
      parserTimeToPixel(action.maxEnd || Number.MAX_VALUE, {
        startLeft,
        scale,
        scaleWidth,
      }),
    );

    setEditorState((prevState) => ({
      tracks: prevState.tracks,
      ghostAction: {
        action: {
          ...action,
          id: action.id + '-ghost',
        },
        origAction: {
          ...action,
        },
        row,
        origRow: row,
        rowIndex,
        origRowIndex: rowIndex,
        dragInfo: {
          startX: clientX,
          startY: clientY,
          rightLimit,
          leftLimit,
        },
      },
    }));
  }, []);

  const handleMouseUp = useCallback(
    (_: React.MouseEvent<HTMLDivElement>) => {
      if (!ghostAction) return;
      disposeDragLine();

      // Create a deep copy of the editor data to avoid direct mutations
      const updatedEditorData = [...editorData];

      // Find the original row and action
      const origRowIndex = ghostAction.origRowIndex;
      // Find the target row
      const targetRowIndex = ghostAction.rowIndex;

      // Update the action with new start and end times
      const origAction = ghostAction.origAction;
      origAction.start = ghostAction.action.start;
      origAction.end = ghostAction.action.end;

      // Remove the action from the original row
      updatedEditorData[origRowIndex] = {
        ...updatedEditorData[origRowIndex],
        actions: updatedEditorData[origRowIndex].actions.filter((item) => item.id !== ghostAction.origAction.id),
      };

      // Add the action to the target row
      updatedEditorData[targetRowIndex] = {
        ...updatedEditorData[targetRowIndex],
        actions: [...updatedEditorData[targetRowIndex].actions, origAction],
      };

      // Update the editor data
      setEditorData(updatedEditorData);

      // Execute callback
      if (onActionMoveEnd)
        onActionMoveEnd({
          action: origAction,
          row: ghostAction.row,
          start: origAction.start,
          end: origAction.end,
        });
    },
    [ghostAction, editorData, setEditorData],
  );

  /** Get the rendering content for each cell */
  const cellRenderer: GridCellRenderer = ({ rowIndex, key, style }) => {
    const row = editorData[rowIndex]; // Row data

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
        ghostAction={ghostAction?.rowIndex === rowIndex ? ghostAction?.action : undefined}
        onMouseEnter={(row) => updateCurrentRow(rowIndex, row)}
        onDragStart={(action: TimelineAction, row: TimelineRow, clientX: number, clientY: number) => {
          handleInitDragLine({ action, row });
          onDragStart(action, row, clientX, clientY, rowIndex);
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
    gridRef.current.recomputeGridSize();
  }, [editorData]);

  return (
    <div ref={editAreaRef} className={prefix('edit-area')} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={() => updateCurrentRow(-0)}>
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
