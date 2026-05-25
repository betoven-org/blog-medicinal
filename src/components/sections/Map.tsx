/**
 * @title Map
 * @description Mapa do Google Maps incorporado com endereço
 * @group Institucional
 */

export interface Props {
  /** Título opcional acima do mapa */
  title?: string;
  /** Endereço exibido como texto */
  address: string;
  /** URL de embed do Google Maps */
  mapUrl: string;
  /**
   * Altura do mapa em pixels
   * @default 400
   */
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
