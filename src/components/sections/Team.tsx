/** Manifest-compatible type alias */
type ImageWidget = string;

/**
 * @title Equipe
 * @description Grid de membros da equipe com foto, cargo e bio
 * @group Institucional
 */
export interface Props {
  /** @title Titulo */
  title: string;

  /** @title Subtitulo */
  subtitle?: string;

  /** @title Colunas */
  /** @default 3 */
  columns?: number;

  /** @title Membros */
  members: {
    /** @title Nome */
    name: string;
    /** @title Cargo */
    role: string;
    /** @title Bio */
    /** @format textarea */
    bio: string;
    /** @title Foto */
    /** @format image */
    photo: ImageWidget;
    /** @title LinkedIn URL */
    linkedin?: string;
  }[];
}

export default function Team({ title, subtitle, columns = 3, members }: Props) {
  const gridCols =
    columns === 2 ? "lg:grid-cols-2" : columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-3 text-lg text-gray-500">{subtitle}</p>}
        </div>
        <div className={`grid gap-8 ${gridCols}`}>
          {members?.map((member, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-6 text-center">
              <img
                src={member.photo}
                alt={member.name}
                className="mx-auto mb-4 h-24 w-24 rounded-full object-cover"
                width={96}
                height={96}
              />
              <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm font-medium text-green-700">{member.role}</p>
              <p className="mt-2 text-sm text-gray-500">{member.bio}</p>
              {member.linkedin && (
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
