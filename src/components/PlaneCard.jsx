import { useState } from "react";
import { Target, Lightbulb, Weight, ChevronDown } from "lucide-react";
import { rowKg, rowAt, variantBombs, bombLabel, iconFile } from "../data/planes";
import BombIcon from "./BombIcon";

const RANK = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const base = import.meta.env.BASE_URL;

const fmtKg = (kg) =>
	kg >= 1000 ? `${Number((kg / 1000).toFixed(2))} t` : `${kg} kg`;

const fmtBr = (n) => n.toFixed(1);

// One sheet row = one line of icon tiles, one tile per base column. Names live in the legend below.
// Tiles past the variant's max bases are leftovers that can't fully destroy a base (dashed).
function Row({ row, bases, cols, dim, selected }) {
	const label =
		row.max != null ? `▲ ≤ ${fmtBr(row.max)}` : row.min != null ? `▼ ≥ ${fmtBr(row.min)}` : "All BRs";
	return (
		<div className={`sheet-row${dim ? " dim" : ""}`}>
			<span className="sheet-label">{label}</span>
			<div className="sheet-cells" style={{ "--cols": cols }}>
				{Array.from({ length: cols }, (_, i) => {
					const cell = row.cells[i];
					if (!cell) return <span key={i} className="cell blank" />;
					const partial = i >= bases;
					const title = cell.map((c) => `${bombLabel(c.bomb)} × ${c.count}`).join(" + ");
					return (
						<span
							key={i}
							title={title + (partial ? " (not enough for a full base)" : "")}
							className={`cell${partial ? " partial" : ""}${cell.some((c) => selected.has(c.bomb)) ? " selected" : ""}`}>
							{cell.map((c, j) => (
								<span key={j} className="cell-bomb">
									<i>{bombLabel(c.bomb)}</i>
									<b>×{c.count}</b>
								</span>
							))}
						</span>
					);
				})}
				{row.extra ? <span className="cell more">+{row.extra}</span> : null}
			</div>
		</div>
	);
}

// One hardpoint tile: the icon name from planes.json is looked up in bombs.json ("icons") and loaded from public/icons/bombs/.
// No file assigned (or the file is missing) -> the tile shows the icon name instead, so it's easy to see what to add.
function TileIcon({ name }) {
	const [broken, setBroken] = useState(false);
	const file = iconFile(name);
	return !file || broken ? (
		<span className="tile-missing" title={`${name}: no image assigned`}>
			{name}
		</span>
	) : (
		<img
			src={`${base}icons/bombs/${file}`}
			title={name}
			alt={name}
			loading="lazy"
			onError={() => setBroken(true)}
		/>
	);
}

// The sheet's hardpoint grid: left wing, centre, right wing. "/" = empty hardpoint, anything else = icon name.
function Tiles({ tiles }) {
	return (
		<div className="tiles" style={{ "--tcols": tiles.length }}>
			{tiles.map((name, i) =>
				name === "/" ? (
					<span key={i} className="tile-empty" title="Empty hardpoint" />
				) : (
					<TileIcon key={`${i}-${name}`} name={name} />
				),
			)}
		</div>
	);
}

function Variant({ variant, battleBr, selected, collapsible, startOpen }) {
	const [open, setOpen] = useState(startOpen);
	const cols = Math.max(4, ...variant.rows.map((r) => r.cells.length));
	const active = rowAt(variant, battleBr);
	return (
		<div className="variant">
			<button
				type="button"
				className="variant-stats"
				disabled={!collapsible}
				aria-expanded={open}
				title={collapsible ? (open ? "Hide this loadout" : "Show this loadout") : undefined}
				onClick={() => setOpen(!open)}>
				<span title="Maximum bases destroyable">
					<Target size={14} /> <b>{variant.bases}</b>
				</span>
				<span title="Base reward multiplier">
					<Lightbulb size={14} /> ×{variant.reward.toFixed(1)}
				</span>
				{rowKg(active) > 0 ? (
					<span title="Nominal payload of the active row">
						<Weight size={14} /> {fmtKg(rowKg(active))}
					</span>
				) : null}
				{collapsible ? (
					<ChevronDown size={14} className={`chev${open ? " flip" : ""}`} />
				) : null}
			</button>
			{open ? (
				<div className="variant-body">
					{variant.tiles ? <Tiles tiles={variant.tiles} /> : null}
					{variant.rows.map((row, i) => (
						<Row
							key={i}
							row={row}
							bases={variant.bases}
							cols={cols}
							dim={battleBr != null && row !== active}
							selected={selected}
						/>
					))}
				</div>
			) : null}
		</div>
	);
}

export default function PlaneCard({ plane, selected, maxBases, battleBr, defaultOpen = false }) {
	const [open, setOpen] = useState(defaultOpen);
	return (
		<article className="plane-card" id={plane.id}>
			<div className="plane-head">
				<img
					className="plane-icon"
					src={`${base}icons/planes/${plane.id}.png`}
					alt=""
					loading="lazy"
				/>
				<h3 className={plane.premium ? "premium" : ""}>{plane.name}</h3>
				<div className="badges">
					<span className="badge rank" title="Rank">
						Rank {RANK[plane.rank]}
					</span>
					<span className="badge br" title="Base BR">
						BR {fmtBr(plane.br)}
					</span>
				</div>
			</div>

			<div className="bases">
				<div className="bases-num" title="Maximum bases destroyable">
					<Target size={20} />
					<strong>{plane.bases}</strong>
					<span>{plane.bases === 1 ? "base" : "bases"} max</span>
				</div>
				<div className="bar" aria-hidden="true">
					<i style={{ width: `${(plane.bases / maxBases) * 100}%` }} />
				</div>
			</div>

			<button
				type="button"
				className="toggle"
				aria-expanded={open}
				onClick={() => setOpen(!open)}>
				{open ? "Hide loadouts" : "Show loadouts"}
				<ChevronDown size={16} className={open ? "flip" : ""} />
			</button>

			{open && plane.variants.map((v, i) => (
				<Variant
					key={i}
					variant={v}
					battleBr={battleBr}
					selected={selected}
					collapsible={plane.variants.length > 1}
					startOpen={i === 0}
				/>
			))}
		</article>
	);
}
