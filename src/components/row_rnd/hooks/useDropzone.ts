import { useCallback, useRef } from 'react';
import { DropzoneEvent, DropzoneOptions } from '../dropzone_types';

export interface UseDropzoneOptions {
  accept?: string | Element;
  overlap?: 'pointer' | 'center' | number;
  onDropActivate?: (event: DropzoneEvent) => void;
  onDropDeactivate?: (event: DropzoneEvent) => void;
  onDragEnter?: (event: DropzoneEvent) => void;
  onDragLeave?: (event: DropzoneEvent) => void;
  onDropMove?: (event: DropzoneEvent) => void;
  onDrop?: (event: DropzoneEvent) => void;
}

export function useDropzone(options: UseDropzoneOptions = {}) {
  const {
    accept,
    overlap = 'pointer',
    onDropActivate,
    onDropDeactivate,
    onDragEnter,
    onDragLeave,
    onDropMove,
    onDrop,
  } = options;

  const dropzoneOptions = useRef<DropzoneOptions>({
    accept,
    overlap,
    ondropactivate: onDropActivate,
    ondropdeactivate: onDropDeactivate,
    ondragenter: onDragEnter,
    ondragleave: onDragLeave,
    ondropmove: onDropMove,
    ondrop: onDrop,
  });

  const updateDropzoneOptions = useCallback((newOptions: Partial<UseDropzoneOptions>) => {
    dropzoneOptions.current = {
      ...dropzoneOptions.current,
      accept: newOptions.accept ?? dropzoneOptions.current.accept,
      overlap: newOptions.overlap ?? dropzoneOptions.current.overlap,
      ondropactivate: newOptions.onDropActivate ?? dropzoneOptions.current.ondropactivate,
      ondropdeactivate: newOptions.onDropDeactivate ?? dropzoneOptions.current.ondropdeactivate,
      ondragenter: newOptions.onDragEnter ?? dropzoneOptions.current.ondragenter,
      ondragleave: newOptions.onDragLeave ?? dropzoneOptions.current.ondragleave,
      ondropmove: newOptions.onDropMove ?? dropzoneOptions.current.ondropmove,
      ondrop: newOptions.onDrop ?? dropzoneOptions.current.ondrop,
    };
  }, []);

  return {
    dropzoneOptions: dropzoneOptions.current,
    updateDropzoneOptions,
  };
}
