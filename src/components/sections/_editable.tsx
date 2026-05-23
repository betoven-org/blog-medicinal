type EditableTag = "span" | "p" | "h1" | "h2" | "h3" | "div";

type EditableProps = {
  blockId: string;
  propKey: string;
  children: React.ReactNode;
  tag?: EditableTag;
  richText?: boolean;
};

export function Editable({
  blockId,
  propKey,
  children,
  tag = "span",
  richText = false,
}: EditableProps) {
  const Tag = tag;
  return (
    <Tag
      data-brasa-block={blockId}
      data-brasa-prop={propKey}
      data-brasa-rich={richText ? "true" : undefined}
    >
      {children}
    </Tag>
  );
}

type EditableImageProps = {
  blockId: string;
  propKey: string;
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
};

export function EditableImage({
  blockId,
  propKey,
  src,
  alt,
  className,
  width,
  height,
}: EditableImageProps) {
  return (
    <img
      data-brasa-block={blockId}
      data-brasa-prop={propKey}
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
    />
  );
}
