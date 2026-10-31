import planesJson from "./planes.json";
import bombsJson from "./bombs.json";

// planes.json -> [{ id, name, country, rank, br, premium, variants: [{
//     bases,            🎯 max bases this loadout can destroy
//     reward,           💡 base reward multiplier
//     icons,            15 hardpoint slots left wing -> centre (index 7) -> right wing; "/" = empty, otherwise an icon name from bombs.json "icons"
//     bombs,            first sheet row: one string per base column, "SC50 x4" or "FC500 x1 + SC50 x4"
//     maxBr?, more?,    first row applies at battle BR <= maxBr; "more" = the sheet's "+ N" extra columns
//     minBr?, bombsHigh? second sheet row, applies at battle BR >= minBr
// }] }]
// bombs.json  -> { bombs: { BOMB_ID: { label, mass (kg | null), icon (icon name | null) } },
//                  icons: { "icon-name": { file: "icon-name.png" | null } } }   all images live in public/icons/bombs/

export const BOMBS = bombsJson.bombs;
export const ICONS = bombsJson.icons;

/** Image file (inside public/icons/bombs/) for an icon name, or null if none is assigned yet. */
export const iconFile = (name) => ICONS[name]?.file ?? null;
export const COUNTRY = "Germany";

const LABEL_BY_ICON = new Map(
	Object.values(bombsJson.bombs)
		.filter((b) => b.icon)
		.map((b) => [b.icon, b.label]),
);
const prettify = (s) =>
	/\d/.test(s)
		? s.toUpperCase()
		: s.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

/** Human-readable name of a hardpoint icon ("m116a2" -> "M116A2", "sc50-8x" -> "SC50 (8-pack)", "gunpod" -> "Gunpod").
 *  Add "label" to an entry in bombs.json "icons" to override. */
export const iconLabel = (name) => {
	if (ICONS[name]?.label) return ICONS[name].label;
	if (LABEL_BY_ICON.has(name)) return LABEL_BY_ICON.get(name);
	const pack = name.match(/^(.+?)-(\d+)x$/);
	if (pack) return `${iconLabel(pack[1])} (${pack[2]}-pack)`;
	const plain = name.replace(/-(dark|black|brown|green|light|old|2)$/, "");
	if (plain !== name && LABEL_BY_ICON.has(plain))
		return LABEL_BY_ICON.get(plain);
	return prettify(name);
};

export const bombLabel = (id) => BOMBS[id]?.label ?? id;
export const bombMass = (id) => BOMBS[id]?.mass ?? 0;

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const ID_BY_LABEL = new Map(
	Object.entries(BOMBS).flatMap(([id, b]) => [
		[norm(b.label), id],
		[norm(id), id],
	]),
);

// "FC500 x1 + SC50 x4" -> [{ bomb: "FC500", count: 1 }, { bomb: "SC50", count: 4 }]
const parseCell = (str) =>
	str.split("+").map((part) => {
		const m = part.trim().match(/^(.+?)\s*x\s*(\d+)$/i);
		return {
			bomb: ID_BY_LABEL.get(norm(m[1])) ?? m[1].trim(),
			count: Number(m[2]),
		};
	});

export const PLANES = planesJson.map((p) => {
	const variants = p.variants.map((v) => {
		const rows = [
			{
				max: v.maxBr ?? null,
				min: null,
				cells: v.bombs.map(parseCell),
				extra: v.more ?? 0,
			},
		];
		if (v.bombsHigh)
			rows.push({
				max: null,
				min: v.minBr ?? null,
				cells: v.bombsHigh.map(parseCell),
				extra: 0,
			});
		return {
			bases: v.bases,
			reward: v.reward,
			tiles: v.icons ?? null,
			rows,
		};
	});
	// plane-level values come from the best variant (most bases)
	const best = variants.reduce((a, b) => (b.bases > a.bases ? b : a));
	return { ...p, variants, bases: best.bases, reward: best.reward };
});

/** The sheet row of a variant that applies at a battle BR (null -> first row). */
export const rowAt = (variant, battleBr) => {
	const second = variant.rows[1];
	return second &&
		battleBr != null &&
		second.min != null &&
		battleBr >= second.min
		? second
		: variant.rows[0];
};

/** Total nominal payload in kg of one row. */
export const rowKg = (row) =>
	row.cells.reduce(
		(sum, cell) =>
			sum +
			cell.reduce((s, { bomb, count }) => s + bombMass(bomb) * count, 0),
		0,
	);

/** Distinct bombs of a variant, in order of first appearance. */
export const variantBombs = (variant) => [
	...new Set(variant.rows.flatMap((r) => r.cells.flat().map((x) => x.bomb))),
];

export const planeBombs = (plane) =>
	new Set(plane.variants.flatMap(variantBombs));

export const ALL_BOMBS = Object.keys(BOMBS).sort(
	(a, b) => bombMass(a) - bombMass(b) || a.localeCompare(b),
);

export const ALL_BRS = [
	...new Set(
		PLANES.flatMap((p) => [
			p.br,
			...p.variants.flatMap((v) =>
				v.rows.flatMap((r) => [r.max, r.min].filter((x) => x != null)),
			),
		]),
	),
].sort((a, b) => a - b);

export const MAX_BASES = Math.max(...PLANES.map((p) => p.bases));
