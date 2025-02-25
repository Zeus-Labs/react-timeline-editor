import { TimelineRow } from '../interface/action';

/**
 * Finds the row index based on Y position
 * @param y The Y position
 * @param editorData The editor data containing rows
 * @param rowHeight The default row height
 * @returns The index of the row at the given Y position
 */
export function findRowIndexByPosition(y: number, editorData: TimelineRow[], rowHeight: number): number {
  let accumulatedHeight = 0;
  
  for (let i = 0; i < editorData.length; i++) {
    const currentRowHeight = editorData[i].rowHeight || rowHeight;
    accumulatedHeight += currentRowHeight;
    
    if (y < accumulatedHeight) {
      return i;
    }
  }
  
  // If y is beyond all rows, return the last row index
  return Math.max(0, editorData.length - 1);
}

/**
 * Calculates the Y position of a row
 * @param rowIndex The index of the row
 * @param editorData The editor data containing rows
 * @param rowHeight The default row height
 * @returns The Y position of the row
 */
export function getRowYPosition(rowIndex: number, editorData: TimelineRow[], rowHeight: number): number {
  let position = 0;
  
  for (let i = 0; i < rowIndex; i++) {
    position += editorData[i].rowHeight || rowHeight;
  }
  
  return position;
}
