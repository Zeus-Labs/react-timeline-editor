# Row RND Component

A React component for creating draggable and resizable elements with dropzone functionality.

## Features

- Draggable elements with customizable options
- Resizable elements with customizable options
- Dropzone functionality for drag and drop interactions
- Auto-scrolling when dragging or resizing near the edges
- Grid-based movement and resizing
- Adsorption to specified positions

## Components

### RowDnd

The main component that provides draggable and resizable functionality.

```tsx
import { RowDnd } from '@zeus-labs/react-timeline-editor';

<RowDnd
  left={100}
  width={200}
  enableDragging={true}
  enableResizing={true}
  grid={10}
  bounds={{ left: 0, right: 1000 }}
  onDragStart={() => console.log('Drag started')}
  onDrag={(data) => console.log('Dragging', data)}
  onDragEnd={(data) => console.log('Drag ended', data)}
  onResizeStart={(dir) => console.log('Resize started', dir)}
  onResize={(dir, data) => console.log('Resizing', dir, data)}
  onResizeEnd={(dir, data) => console.log('Resize ended', dir, data)}
>
  <div style={{ position: 'absolute', height: 50, backgroundColor: 'blue' }}>
    Draggable and Resizable Element
  </div>
</RowDnd>
```

### DropzoneComp

A component that provides dropzone functionality.

```tsx
import { DropzoneComp } from '@zeus-labs/react-timeline-editor';

<DropzoneComp
  enabled={true}
  dropzoneOptions={{
    accept: '.draggable',
    overlap: 'pointer',
    ondrop: (event) => console.log('Item dropped', event),
    ondragenter: (event) => console.log('Drag entered', event),
    ondragleave: (event) => console.log('Drag left', event),
  }}
>
  <div style={{ width: 300, height: 200, border: '2px dashed #ccc' }}>
    Drop Zone
  </div>
</DropzoneComp>
```

## Hooks

### useAutoScroll

A hook that provides auto-scrolling functionality when dragging or resizing near the edges.

```tsx
import { useAutoScroll } from '@zeus-labs/react-timeline-editor';

const { initAutoScroll, dealDragAutoScroll, dealResizeAutoScroll, stopAutoScroll } = useAutoScroll(containerRef);
```

### useDropzone

A hook that simplifies the creation of dropzone options.

```tsx
import { useDropzone } from '@zeus-labs/react-timeline-editor';

const { dropzoneOptions, updateDropzoneOptions } = useDropzone({
  accept: '.draggable',
  overlap: 'pointer',
  onDrop: (event) => console.log('Item dropped', event),
  onDragEnter: (event) => console.log('Drag entered', event),
  onDragLeave: (event) => console.log('Drag left', event),
});
```

## Example

See the `examples/dropzone_example.tsx` file for a complete example of how to use the components together.
