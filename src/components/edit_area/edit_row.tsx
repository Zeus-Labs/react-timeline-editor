import React, { FC } from 'react';
import { TimelineAction, TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import { EditAction } from './edit_action';
import './edit_row.less';

export type EditRowProps = CommonProp & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  rowData?: TimelineRow;
  ghostAction?: TimelineAction;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  /** Distance scrolled from the left */
  scrollLeft: number;
  /** Set scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
  /** Callback triggered when dragging starts */
  onDragStart?: (
    action: TimelineAction,
    row: TimelineRow,
    clientX: number,
    clientY: number,
  ) => void;
  onMouseEnter?: (
    row?: TimelineRow,
  ) => void;
};

export const EditRow: FC<EditRowProps> = (props) => {
  const {
    rowData,
    ghostAction,
    style = {},
    onClickRow,
    onMouseEnter,
    onDoubleClickRow,
    onContextMenuRow,
    areaRef,
    scrollLeft,
    startLeft,
    scale,
    scaleWidth,
  } = props;

  const classNames = ['edit-row'];
  if (rowData?.selected) classNames.push('edit-row-selected');

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    return time;
  };

  //const { onDragStart, onDrag, onDragEnd } = useTimelineDragAndDrop(
  //  {
  //    //overlays,
  //    // TODO: remove this and use time to pixels or something similar
  //    durationInFrames: 1500,
  //    //onOverlayChange,
  //    updateGhostElement: () => console.log("updateGhostElement"),
  //    resetDragState: () => console.log("resetDragState"),
  //    timelineRef: areaRef,
  //    dragInfo,
  //    // TODO: remove this and pass in the list of rows
  //    maxRows: 4,
  //  }
  //);

  //const onDragStart = useCallback((action: TimelineAction, clientX: number, clientY: number) => {
  //  console.log("on drag start edit row", { action, clientX, clientY });
  //  setGhostAction({ ...action, start: action.start - 1, end: action.end - 1 })
  //}, []);
  //
  //const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  //  //console.log("handle mouse moved", { clientX: e.clientX, clientY: e.clientY });
  //}, []);
  //
  //const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
  //  console.log("handle mouse up moved", { clientX: e.clientX, clientY: e.clientY });
  //  setGhostAction(null);
  //}, []);

  return (
    <div
      className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(' ')}`}
      style={style}
      onClick={(e) => {
        if (rowData && onClickRow) {
          const time = handleTime(e);
          onClickRow(e, { row: rowData, time: time });
        }
      }}
      onDoubleClick={(e) => {
        if (rowData && onDoubleClickRow) {
          const time = handleTime(e);
          onDoubleClickRow(e, { row: rowData, time: time });
        }
      }}
      onContextMenu={(e) => {
        if (rowData && onContextMenuRow) {
          const time = handleTime(e);
          onContextMenuRow(e, { row: rowData, time: time });
        }
      }}
      onMouseEnter={() => onMouseEnter(rowData)}
    >
      {(rowData?.actions || []).map((action) => (
        <EditAction key={action.id} {...props} handleTime={handleTime} row={rowData} action={action} />
      ))}

      {ghostAction &&
        <div style={{ opacity: 0.5 }}>
          <EditAction
            key={ghostAction.id + "-ghost"}
            handleTime={handleTime}
            row={rowData}
            action={ghostAction}
            disableDrag={true}

            editorData={props.editorData}
            effects={props.effects}

            scaleCount={props.scaleCount}
            maxScaleCount={props.maxScaleCount}
            setScaleCount={props.setScaleCount}

            startLeft={props.startLeft}
            scale={props.scale}
            scaleWidth={props.scaleWidth}

            dragLineData={props.dragLineData}
            setEditorData={props.setEditorData}
            areaRef={props.areaRef}

            cursorTime={props.cursorTime}
            timelineWidth={props.timelineWidth}
          />
        </div>
      }
    </div>
  );
};
