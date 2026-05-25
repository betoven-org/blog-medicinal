"use client";

/**
 * @title Alert
 * @description Banner de alerta/aviso com cores por tipo e opção de dispensar
 * @group Layout
 */

import { useState } from "react";

export interface Props {
  /** Texto do alerta */
  text: string;
  /**
   * @options info,success,warning,error
   * @default info
   */
  type?: "info" | "success" | "warning" | "error";
  /**
   * Permite fechar o alerta
   * @default false
   */
  dismissible?: boolean;
  /**
   * Exibir ícone
   * @default true
   */
  icon?: boolean;
}

const typeStyles: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  success: "bg-green-50 border-green-200 text-green-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  error: "bg-red-50 border-red-200 text-red-800",
};

const icons: Record<string, string> = {
  info: "\u2139\uFE0F",
  success: "\u2705",
  warning: "\u26A0\uFE0F",
  error: "\u274C",
};

export default function Alert({
  text,
  type = "info",
  dismissible = false,
  icon = true,
}: Props) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 border rounded-lg ${typeStyles[type]}`}
    >
      {icon && <span className="text-lg flex-shrink-0">{icons[type]}</span>}
      <p className="flex-1 text-sm">{text}</p>
      {dismissible && (
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none"
          aria-label="Fechar alerta"
        >
          &times;
        </button>
      )}
    </div>
  );
}
