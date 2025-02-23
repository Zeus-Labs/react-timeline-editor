import React from 'react';
import { OnScrollParams } from 'react-virtualized';
import { TimelineRow } from '../../interface/action';
import { CommonProp } from '../../interface/common_prop';
import './edit_area.less';
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
export declare const EditArea: React.ForwardRefExoticComponent<CommonProp & {
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
} & React.RefAttributes<EditAreaState>>;
