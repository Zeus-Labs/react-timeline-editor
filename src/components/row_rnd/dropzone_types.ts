import { Interactable } from '@interactjs/types';

export interface DropzoneEvent {
  target: HTMLElement;
  dropzone: Interactable;
  relatedTarget: HTMLElement;
  draggable: Interactable;
  dragEvent: any; // DragEvent
  timeStamp: number;
  type: string;
}

export type DropzoneChecker = (
  dragEvent: any, // DragEvent
  event: Event,
  dropped: boolean,
  dropzone: Interactable,
  dropzoneElement: HTMLElement,
  draggable: Interactable,
  draggableElement: HTMLElement
) => boolean;

export interface DropzoneOptions {
  accept?: string | Element;
  overlap?: 'pointer' | 'center' | number;
  checker?: DropzoneChecker;
  ondropactivate?: (event: DropzoneEvent) => void;
  ondropdeactivate?: (event: DropzoneEvent) => void;
  ondragenter?: (event: DropzoneEvent) => void;
  ondragleave?: (event: DropzoneEvent) => void;
  ondropmove?: (event: DropzoneEvent) => void;
  ondrop?: (event: DropzoneEvent) => void;
}
