import React, { FC } from 'react';
import { TimelineAction, TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import { DragLineData } from './drag_lines';
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
    onDragStart?: (action: TimelineAction, row: TimelineRow, clientX: number, clientY: number) => void;
    onMouseEnter?: (row?: TimelineRow) => void;
};
export declare const EditRow: FC<EditRowProps>;
