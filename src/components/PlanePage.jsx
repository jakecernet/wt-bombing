import { useState } from "react";
import { ArrowLeft, Target, Lightbulb, Weight } from "lucide-react";
import { rowKg, rowAt, bombLabel, bombMass, iconLabel } from "../data/planes";
import { ROMAN, fmtBr, fmtKg, nameClass } from "../format";
import BombIcon from "./BombIcon";
import { TileIcon, planeIconSrc } from "./PlaneCard";

// Hardpoint diagram: every slot of the plane, left wing -> centre -> right wing, big enough to read.
function Hardpoints({ tiles }) {
	const n = tiles.length;
	const mid = Math.floor(n / 2);
	const used = tiles.filter((t) => t !== "/");
	// legend entries are keyed by display name, so colour variants of one bomb merge
	const counts = new Map();
	used.forEach((t) => {
		const label = iconLabel(t);
		const e = counts.get(label);
		if (e) e.c++;
		else counts.set(label, { icon: t, c: 1 });
	});
	return (
		<section className="panel">
			<div className="panel-head">
				<h3>Hardpoints</h3>
				<p>
					{used.length} of {n} slots used · hover a slot for its name
				</p>
			</div>
			<div className="hp-scroll">
				<div className="hp" style={{ "--tcols": n }}>
					<div className="hp-tiles">
						{tiles.map((name, i) => (
							<div
								key={i}
								className={`hp-slot${i === mid ? " centre" : ""}${name === "/" ? " empty" : ""}`}>
								{name === "/" ? (
									<span
										className="tile-empty"
										title={`Slot ${i + 1}: empty`}
									/>
								) : (
									<TileIcon name={name} />
								)}
								<small>{i + 1}</small>
							</div>
						))}
					</div>
					<div className="hp-zones" aria-hidden="true">
						<span style={{ gridColumn: `1 / ${mid + 1}` }}>
							Left wing
						</span>
						<span
							style={{ gridColumn: `${mid + 1} / ${mid + 2}` }}
							title="Centre / fuselage">
							C
						</span>
						<span style={{ gridColumn: `${mid + 2} / -1` }}>
							Right wing
						</span>
					</div>
				</div>
			</div>
			{counts.size ? (
				<ul className="hp-legend">
					{[...counts].map(([label, { icon, c }]) => (
						<li key={label}>
							<span className="hp-legend-icon">
								<TileIcon name={icon} />
							</span>
							<span>{label}</span>
							<b>×{c}</b>
						</li>
					))}
				</ul>
			) : null}
		</section>
	);
}

// What is dropped per base for one battle-BR bracket.
function Bracket({ row, bases }) {
	const title =
		row.max != null
			? `Battle BR ≤ ${fmtBr(row.max)}`
			: row.min != null
				? `Battle BR ≥ ${fmtBr(row.min)}`
				: "All battle BRs";
	const kg = rowKg(row);
	return (
		<div className="bracket">
			<div className="bracket-head">
				<h4>{title}</h4>
				{kg > 0 ? (
					<span title="Nominal payload">
						<Weight size={14} /> {fmtKg(kg)}
					</span>
				) : null}
			</div>
			<div className="base-grid">
				{row.cells.map((cell, i) => {
					const partial = i >= bases;
					return (
						<div
							key={i}
							className={`base-cell${partial ? " partial" : ""}`}>
							<span className="base-no">
								{partial ? "Leftover" : `Base ${i + 1}`}
							</span>
							{cell.map((c, j) => (
								<span
									key={j}
									className="base-bomb"
									title={`${bombLabel(c.bomb)}${bombMass(c.bomb) ? ` · ${bombMass(c.bomb)} kg` : ""}`}>
									<BombIcon bomb={c.bomb} size={22} />
									<i>{bombLabel(c.bomb)}</i>
									<b>×{c.count}</b>
								</span>
							))}
						</div>
					);
				})}
				{row.extra ? (
					<span className="base-cell more">+{row.extra} more</span>
				) : null}
			</div>
			{row.cells.length > bases ? (
				<p className="bracket-note">
					Dashed entries are not enough for another full base.
				</p>
			) : null}
		</div>
	);
}

export default function PlanePage({ plane, battleBr, onBattleBr, onBack }) {
	const [vi, setVi] = useState(0);
	const variant = plane.variants[vi];
	const rows = variant.rows;
	const active = rowAt(variant, battleBr);
	const hasTwo = rows.length > 1;
	const mode =
		battleBr == null || !hasTwo
			? "both"
			: active === rows[1]
				? "high"
				: "low";

	const pick = (m) => {
		if (m === "both") onBattleBr(null);
		else if (m === "high") onBattleBr(rows[1].min);
		else
			onBattleBr(
				rows[0].max ?? Math.max(0, (rows[1].min ?? plane.br) - 0.1),
			);
	};

	return (
		<main className="page plane-page">
			<button type="button" className="back" onClick={onBack}>
				<ArrowLeft size={16} /> Back
			</button>

			<div className="pp-head">
				<img className="pp-icon" src={planeIconSrc(plane)} alt="" />
				<div>
					<h2 className={nameClass(plane)}>{plane.name}</h2>
					<div className="badges">
						<span className="badge rank">
							Rank {ROMAN[plane.rank]}
						</span>
						<span className="badge br">BR {fmtBr(plane.br)}</span>
						<span className="badge">{plane.country}</span>
					</div>
				</div>
			</div>

			{plane.variants.length > 1 ? (
				<div
					className="tabs"
					role="tablist"
					aria-label="Loadout variant">
					{plane.variants.map((v, i) => (
						<button
							key={i}
							role="tab"
							aria-selected={i === vi}
							className={i === vi ? "on" : ""}
							onClick={() => setVi(i)}>
							Loadout {i + 1}{" "}
							<small>
								· {v.bases} {v.bases === 1 ? "base" : "bases"}
							</small>
						</button>
					))}
				</div>
			) : null}

			<div className="stat-row">
				<div className="stat" title="Maximum bases destroyable">
					<Target size={20} />
					<strong>{variant.bases}</strong>
					<span>{variant.bases === 1 ? "base" : "bases"} max</span>
				</div>
				<div className="stat" title="Base reward multiplier">
					<Lightbulb size={20} />
					<strong>
						{variant.reward == null
							? "?"
							: `×${variant.reward.toFixed(1)}`}
					</strong>
					<span>reward multiplier</span>
				</div>
				{rowKg(active) > 0 ? (
					<div
						className="stat"
						title="Nominal payload of the selected bracket">
						<Weight size={20} />
						<strong>{fmtKg(rowKg(active))}</strong>
						<span>payload</span>
					</div>
				) : null}
			</div>

			{variant.tiles ? <Hardpoints tiles={variant.tiles} /> : null}

			<section className="panel">
				<div className="panel-head">
					<h3>Bombs per base</h3>
					{hasTwo ? (
						<div
							className="segmented"
							role="group"
							aria-label="Battle BR bracket">
							<button
								className={mode === "both" ? "on" : ""}
								onClick={() => pick("both")}>
								Both
							</button>
							<button
								className={mode === "low" ? "on" : ""}
								onClick={() => pick("low")}>
								BR ≤ {fmtBr(rows[0].max ?? 0)}
							</button>
							<button
								className={mode === "high" ? "on" : ""}
								onClick={() => pick("high")}>
								BR ≥ {fmtBr(rows[1].min ?? 0)}
							</button>
						</div>
					) : null}
				</div>
				{rows
					.map((row, i) => ({ row, i }))
					.filter(({ row }) => mode === "both" || row === active)
					.map(({ row, i }) => (
						<Bracket key={i} row={row} bases={variant.bases} />
					))}
			</section>
		</main>
	);
}
