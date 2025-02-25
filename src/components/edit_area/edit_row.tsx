import React, { FC, useRef, useState } from 'react';
import { TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { prefix } from '../../utils/deal_class_prefix';
import { parserPixelToTime } from '../../utils/deal_data';
import { DragLineData } from './drag_lines';
import { EditAction } from './edit_action';
import './edit_row.less';
import { useDropzone } from '../row_rnd/hooks/useDropzone';
import { DropzoneEvent } from '../row_rnd/dropzone_types';
import { RowDnd } from '../row_rnd/row_rnd';
import { findRowIndexByPosition } from '../../utils/row_utils';

export type EditRowProps = CommonProp & {
  areaRef: React.MutableRefObject<HTMLDivElement>;
  rowData?: TimelineRow;
  style?: React.CSSProperties;
  dragLineData: DragLineData;
  setEditorData: (params: TimelineRow[]) => void;
  /** Distance scrolled from the left */
  scrollLeft: number;
  /** Set scroll left */
  deltaScrollLeft: (scrollLeft: number) => void;
  /** Row index in the editor data */
  rowIndex: number;
};

export const EditRow: FC<EditRowProps> = (props) => {
  const { 
    rowData, 
    style = {}, 
    onClickRow, 
    onDoubleClickRow, 
    onContextMenuRow, 
    areaRef, 
    scrollLeft, 
    startLeft, 
    scale, 
    scaleWidth,
    editorData,
    setEditorData,
    rowHeight,
    rowIndex
  } = props;

  const [isDropTarget, setIsDropTarget] = useState(false);
  
  const classNames = ['edit-row'];
  if (rowData?.selected) classNames.push('edit-row-selected');
  if (isDropTarget) classNames.push('edit-row-drop-target');

  const handleTime = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (!areaRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    const position = e.clientX - rect.x;
    const left = position + scrollLeft;
    const time = parserPixelToTime(left, { startLeft, scale, scaleWidth });
    return time;
  };

  // Handle dropzone events
  const handleDragEnter = (event: DropzoneEvent) => {
    setIsDropTarget(true);
    
    // Get the action ID from the dragged element
    const actionId = event.relatedTarget.getAttribute('data-action-id');
    const sourceRowId = event.relatedTarget.getAttribute('data-row-id');
    
    // Only highlight if it's a different row
    if (sourceRowId !== rowData?.id) {
      setIsDropTarget(true);
    } else {
      setIsDropTarget(false);
    }
  };

  const handleDragLeave = () => {
    setIsDropTarget(false);
  };

  const handleDrop = (event: DropzoneEvent) => {
    setIsDropTarget(false);
    
    // Get the action ID and source row ID from the dragged element
    const actionId = event.relatedTarget.getAttribute('data-action-id');
    const sourceRowId = event.relatedTarget.getAttribute('data-row-id');
    
    // Don't do anything if dropped in the same row
    if (!actionId || sourceRowId === rowData?.id) return;
    
    // Find the source row and action
    const sourceRow = editorData.find(row => row.id === sourceRowId);
    if (!sourceRow) return;
    
    const actionIndex = sourceRow.actions.findIndex(action => action.id === actionId);
    if (actionIndex === -1) return;
    
    // Clone the action
    const action = { ...sourceRow.actions[actionIndex] };
    
    // Remove from source row
    sourceRow.actions = sourceRow.actions.filter(a => a.id !== actionId);
    
    // Add to target row
    rowData.actions.push(action);
    
    // Update editor data
    setEditorData([...editorData]);
  };

  const { dropzoneOptions } = useDropzone({
    accept: '[data-action-id]',
    overlap: 'pointer',
    onDragEnter: handleDragEnter,
    onDragLeave: handleDragLeave,
    onDrop: handleDrop
  });

  return (
    <RowDnd
      enableDragging={false}
      enableResizing={false}
      enableDropzone={true}
      dropzoneOptions={dropzoneOptions}
    >
      <div
        className={`${prefix(...classNames)} ${(rowData?.classNames || []).join(' ')}`}
        style={{
          ...style,
          position: 'relative',
          transition: 'background-color 0.2s ease',
          backgroundColor: isDropTarget ? 'rgba(52, 152, 219, 0.1)' : undefined
        }}
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
        data-row-id={rowData?.id}
      >
        {(rowData?.actions || []).map((action) => (
          <EditAction 
            key={action.id} 
            {...props} 
            handleTime={handleTime} 
            row={rowData} 
            action={action} 
            enableDragBetweenTracks={true}
          />
        ))}
      </div>
    </RowDnd>
  );
};
