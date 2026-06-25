import { WeatherWidget } from "@/components/WeatherWidget";

/**
 * @title Barra de Temperatura
 * @description Mostra a temperatura local do usuario com geolocalizacao
 * @group Global
 */
export interface Props {
  /** @title Texto do botao */
  /** @default Ver temperatura local */
  buttonText?: string;
}

export default function WeatherBar({ buttonText = "Ver temperatura local" }: Props) {
  return (
    <div className="bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-end">
        <WeatherWidget buttonText={buttonText} />
      </div>
    </div>
  );
}
