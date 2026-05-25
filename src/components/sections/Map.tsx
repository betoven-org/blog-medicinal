/**
 * @title Mapa
 * @description Mapa do Google Maps incorporado com endereço
 * @group Institucional
 */

export interface Props {
  /** @title Titulo */
  title?: string;
  /** @title Endereco */
  address: string;
  /** @title URL do mapa (embed) */
  mapUrl: string;
  /** @title Altura do mapa (px) */
  /** @default 400 */
  height?: number;
}

export default function Map({ title, address, mapUrl, height = 400 }: Props) {
  return (
    <section className="w-full">
      {title && (
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
      )}
      <p className="text-gray-600 mb-4 text-sm">{address}</p>
      <div className="w-full rounded-lg overflow-hidden">
        <iframe
          src={mapUrl}
          width="100%"
          height={height}
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={title || "Mapa"}
        />
      </div>
    </section>
  );
}
