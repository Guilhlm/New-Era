import tacoRaw from '@/app/api/foods/_data/TACO.json';
import {
  formatPer100gLabel,
  type FoodMacrosPer100g,
  type FoodSearchResult,
} from '@/utils/food-nutrition';

type TacoRawEntry = {
  id: number;
  description: string;
  category?: string;
  energy_kcal?: number | string;
  protein_g?: number | string;
  carbohydrate_g?: number | string;
  lipid_g?: number | string;
};

type TacoFoodIndex = {
  id: number;
  description: string;
  category: string;
  normalizedDescription: string;
  result: FoodSearchResult;
};

const CACHE_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, { expiresAt: number; results: FoodSearchResult[] }>();

function parseTacoNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'NA' || trimmed === 'Tr') return 0;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function toPer100g(entry: TacoRawEntry): FoodMacrosPer100g | null {
  const per100g: FoodMacrosPer100g = {
    calories: Math.round(parseTacoNumber(entry.energy_kcal)),
    protein: round1(parseTacoNumber(entry.protein_g)),
    carbs: round1(parseTacoNumber(entry.carbohydrate_g)),
    fats: round1(parseTacoNumber(entry.lipid_g)),
  };

  if (per100g.calories <= 0 && per100g.protein <= 0 && per100g.carbs <= 0 && per100g.fats <= 0) {
    return null;
  }

  return per100g;
}

function toSearchResult(entry: TacoRawEntry, per100g: FoodMacrosPer100g): FoodSearchResult {
  const description = entry.description.trim();
  const externalFoodId = String(entry.id);

  return {
    id: `taco:${externalFoodId}`,
    source: 'taco',
    externalFoodId,
    name: description,
    displayName: description,
    per100g,
    per100gLabel: formatPer100gLabel(per100g),
  };
}

function buildTacoIndex(): TacoFoodIndex[] {
  return (tacoRaw as TacoRawEntry[])
    .map((entry) => {
      const per100g = toPer100g(entry);
      if (!per100g) return null;

      const description = entry.description.trim();
      return {
        id: entry.id,
        description,
        category: entry.category?.trim() ?? '',
        normalizedDescription: normalizeSearchText(description),
        result: toSearchResult(entry, per100g),
      };
    })
    .filter((entry): entry is TacoFoodIndex => entry !== null);
}

const TACO_INDEX = buildTacoIndex();

function scoreTacoMatch(entry: TacoFoodIndex, needle: string) {
  if (!needle) return 0;

  const { normalizedDescription, category } = entry;
  const normalizedCategory = normalizeSearchText(category);

  if (normalizedDescription === needle) return 100;
  if (normalizedDescription.startsWith(needle)) return 90;

  const words = normalizedDescription.split(/[\s,]+/).filter(Boolean);
  if (words.some((word) => word.startsWith(needle))) return 85;

  if (normalizedDescription.includes(needle)) return 70;
  if (normalizedCategory.includes(needle)) return 40;

  return 0;
}

function searchTacoFoods(query: string, limit: number): FoodSearchResult[] {
  const normalizedQuery = normalizeSearchText(query.trim());
  if (normalizedQuery.length < 2) return [];

  return TACO_INDEX.map((entry) => ({ entry, score: scoreTacoMatch(entry, normalizedQuery) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.id - b.entry.id)
    .slice(0, limit)
    .map(({ entry }) => entry.result);
}

export async function searchFoods(query: string, limit: number) {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery.length < 2) {
    return { results: [] as FoodSearchResult[] };
  }

  const cacheKey = `${normalizedQuery}:${limit}:taco-v1`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return { results: cached.results };
  }

  const results = searchTacoFoods(normalizedQuery, limit);

  if (results.length > 0) {
    cache.set(cacheKey, { expiresAt: Date.now() + CACHE_TTL_MS, results });
  }

  return { results };
}
