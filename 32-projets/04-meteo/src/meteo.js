// Tout ce qui ne dépend ni du réseau ni du DOM : construction des URL,
// transformation des réponses d'Open-Meteo, libellés et formatage. Testable dans Node.

export const URL_GEOCODAGE = "https://geocoding-api.open-meteo.com/v1/search";
export const URL_PREVISIONS = "https://api.open-meteo.com/v1/forecast";

// Codes météo WMO utilisés par Open-Meteo (champ weather_code).
const CODES_WMO = {
  0: ["Ciel dégagé", "☀️"],
  1: ["Plutôt dégagé", "🌤️"],
  2: ["Partiellement nuageux", "⛅"],
  3: ["Couvert", "☁️"],
  45: ["Brouillard", "🌫️"],
  48: ["Brouillard givrant", "🌫️"],
  51: ["Bruine légère", "🌦️"],
  53: ["Bruine modérée", "🌦️"],
  55: ["Bruine dense", "🌦️"],
  56: ["Bruine verglaçante légère", "🌧️"],
  57: ["Bruine verglaçante dense", "🌧️"],
  61: ["Pluie faible", "🌧️"],
  63: ["Pluie modérée", "🌧️"],
  65: ["Pluie forte", "🌧️"],
  66: ["Pluie verglaçante faible", "🌧️"],
  67: ["Pluie verglaçante forte", "🌧️"],
  71: ["Neige faible", "🌨️"],
  73: ["Neige modérée", "🌨️"],
  75: ["Neige forte", "❄️"],
  77: ["Grains de neige", "🌨️"],
  80: ["Averses faibles", "🌦️"],
  81: ["Averses modérées", "🌦️"],
  82: ["Averses violentes", "⛈️"],
  85: ["Averses de neige faibles", "🌨️"],
  86: ["Averses de neige fortes", "🌨️"],
  95: ["Orage", "⛈️"],
  96: ["Orage avec grêle faible", "⛈️"],
  97: ["Orage violent", "⛈️"],
  99: ["Orage avec forte grêle", "⛈️"],
};

/** Description et icône d'un code WMO ; un code inconnu ne fait pas planter l'affichage. */
export function decrireCode(code) {
  const [description, icone] = CODES_WMO[code] ?? [
    "Conditions inconnues",
    "❔",
  ];
  return { description, icone };
}

export function urlGeocodage(nom, { nombre = 5, langue = "fr" } = {}) {
  const url = new URL(URL_GEOCODAGE);
  // URLSearchParams encode correctement les espaces, accents et caractères spéciaux.
  url.search = new URLSearchParams({
    name: nom,
    count: nombre,
    language: langue,
    format: "json",
  });
  return url.href;
}

export function urlPrevisions({ latitude, longitude }, { jours = 7 } = {}) {
  const url = new URL(URL_PREVISIONS);
  url.search = new URLSearchParams({
    latitude,
    longitude,
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    timezone: "auto", // heures exprimées dans le fuseau du lieu
    forecast_days: jours,
  });
  return url.href;
}

/** Réponse du géocodage → liste de lieux. Sans résultat, l'API omet simplement « results ». */
export function transformerLieux(json) {
  return (json?.results ?? []).map((r) => ({
    id: r.id,
    nom: r.name,
    region: r.admin1 ?? "",
    pays: r.country ?? r.country_code ?? "",
    latitude: r.latitude,
    longitude: r.longitude,
  }));
}

/** « Paris, Texas, États-Unis » : de quoi distinguer les homonymes. */
export function libelleLieu({ nom, region, pays }) {
  return [nom, region, pays].filter(Boolean).join(", ");
}

/** Réponse des prévisions → objet prêt à afficher, avec des noms de propriétés à nous. */
export function transformerPrevisions(json) {
  const {
    current: actuel,
    current_units: unites,
    daily: quotidien,
  } = json ?? {};
  if (!actuel || !unites || !Array.isArray(quotidien?.time)) {
    throw new TypeError("Réponse de prévisions inattendue.");
  }
  return {
    fuseau: json.timezone,
    actuel: {
      heure: actuel.time.slice(11, 16), // « 2026-11-06T09:15 » est déjà l'heure locale du lieu
      temperature: formaterTemperature(
        actuel.temperature_2m,
        unites.temperature_2m,
      ),
      ressentie: formaterTemperature(
        actuel.apparent_temperature,
        unites.apparent_temperature,
      ),
      humidite: `${actuel.relative_humidity_2m} ${unites.relative_humidity_2m}`,
      vent: `${Math.round(actuel.wind_speed_10m)} ${unites.wind_speed_10m}`,
      estJour: actuel.is_day === 1,
      ...decrireCode(actuel.weather_code),
    },
    jours: quotidien.time.map((date, i) => ({
      date,
      min: formaterTemperature(
        quotidien.temperature_2m_min[i],
        unites.temperature_2m,
      ),
      max: formaterTemperature(
        quotidien.temperature_2m_max[i],
        unites.temperature_2m,
      ),
      pluie: quotidien.precipitation_probability_max?.[i] ?? null, // en %, peut manquer
      ...decrireCode(quotidien.weather_code[i]),
    })),
  };
}

/**
 * 8.6 → « 9 °C ». Math.round(-0.4) vaut -0, mais un gabarit de chaîne l'affiche « 0 »
 * (String(-0) vaut "0") : pas de « -0 °C » disgracieux.
 */
export function formaterTemperature(valeur, unite = "°C") {
  return `${Math.round(valeur)} ${unite}`; // espace insécable avant l'unité
}

/**
 * « 2026-11-06 » → « vendredi 6 novembre ».
 * new Date("2026-11-06") désigne minuit UTC : on formate donc en UTC, sinon un fuseau
 * en retard sur UTC (Amérique) afficherait la veille.
 */
export function formaterJour(date, locale = "fr-FR") {
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(new Date(date));
}
