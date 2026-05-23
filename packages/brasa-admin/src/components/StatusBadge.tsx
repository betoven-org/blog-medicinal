type Props = {
  status: "draft" | "published";
};

export default function StatusBadge({ status }: Props) {
  const isDraft = status === "draft";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isDraft
          ? "bg-yellow-100 text-yellow-800"
          : "bg-green-100 text-green-800"
      }`}
    >
      {isDraft ? "Rascunho" : "Publicado"}
    </span>
  );
}
