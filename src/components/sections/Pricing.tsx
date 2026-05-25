/**
 * @title Pricing
 * @description Grade de planos com destaque para plano principal
 * @group Institucional
 */

export interface PricingPlan {
  /** @title Nome do plano */
  name: string;
  /** @title Preco */
  price: string;
  /** @title Periodo */
  /** @default mes */
  period?: string;
  /** @title Descricao */
  /** @format textarea */
  description: string;
  /** @title Funcionalidades */
  /** @description Lista de funcionalidades separadas por virgula */
  features: string;
  /** @title Destacar plano */
  /** @default false */
  highlighted?: boolean;
  /** @title Texto do botao */
  buttonText: string;
  /** @title Link do botao */
  buttonHref: string;
}

export interface Props {
  /** @title Titulo */
  /** @default Planos */
  title?: string;
  /** @title Subtitulo */
  subtitle?: string;
  /** @title Planos */
  plans: PricingPlan[];
}

export default function Pricing({
  title = "Planos",
  subtitle,
  plans = [],
}: Props) {
  return (
    <section className="w-full py-16 md:py-24 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-4 text-lg text-gray-600">{subtitle}</p>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const featureList = plan.features
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean);

            return (
              <div
                key={index}
                className={`relative flex flex-col rounded-2xl border p-8 ${
                  plan.highlighted
                    ? "border-blue-500 shadow-xl shadow-blue-100 scale-105"
                    : "border-gray-200 shadow-sm"
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-4 py-1 text-xs font-semibold text-white">
                    Destaque
                  </div>
                )}

                <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gray-900">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-gray-500">/{plan.period || "mes"}</span>
                  )}
                </div>

                <p className="mt-4 text-gray-600">{plan.description}</p>

                <ul className="mt-6 flex-1 space-y-3">
                  {featureList.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <svg
                        className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={plan.buttonHref}
                  className={`mt-8 block rounded-lg py-3 text-center font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-900 text-white hover:bg-gray-800"
                  }`}
                >
                  {plan.buttonText}
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
