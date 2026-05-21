type Props = {
  name: string;
  className?: string;
};

export function CategoryBadge({ name, className = "" }: Props) {
  return (
    <span
      className={`text-[11px] font-semibold uppercase tracking-wider text-blue-700 ${className}`}
    >
      {name}
    </span>
  );
}
