import { useState } from "react";
import { Plane, ChevronDown } from "lucide-react";
import { PLANES, bombMass, bombLabel } from "../data/planes";
import BombIcon from "./BombIcon";

// Largest number of this bomb the plane carries in one row of any variant.
const carried = (plane, bomb) =>
	Math.max(
		0,
		...plane.variants.flatMap((v) =>
			v.rows.map((r) =>
				r.cells.flat().filter((x) => x.bomb === bomb).reduce((n, x) => n + x.count, 0),
			),
		),
	);

export default function BombCard({ bomb, onPlane }) {
	const [open, setOpen] = useState(false);
	const mass = bombMass(bomb);
	const users = PLANES.map((p) => ({ plane: p, n: carried(p, bomb) }))
		.filter((u) => u.n > 0)
		.sort((a, b) => b.plane.bases - a.plane.bases || b.n - a.n);
	const ranks = [...new Set(users.map((u) => u.plane.rank))].sort((a, b) => a - b);
	const best = users[0]?.plane;

	return (
		<article className="plane-card bomb-card">
			<div className="plane-head">
				<BombIcon bomb={bomb} size={34} />
				<h3>{bombLabel(bomb)}</h3>
				<div className="badges">
					<span className="badge br" title="Nominal mass from the name">
						{mass ? `${mass} kg` : "?"}
					</span>
				</div>
			</div>
			<div className="stats">
				<span>
					<Plane size={15} /> {users.length} {users.length === 1 ? "plane" : "planes"}
				</span>
				<span>Rank {ranks.join(", ")}</span>
			</div>
			{best ? (
				<p className="note">
					Most bases: {best.name} ({best.bases})
				</p>
			) : null}
			<button className="toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
				{open ? "Hide planes" : "Show planes"}
				<ChevronDown size={16} className={open ? "flip" : ""} />
			</button>
			{open ? (
				<div className="details">
					<div className="plane-links">
						{users.map(({ plane, n }) => (
							<button
								key={plane.id}
								className="chip pick"
								onClick={() => onPlane(plane)}
								title={`Up to ${n} per row`}>
								{plane.name} <b>×{n}</b>
							</button>
						))}
					</div>
				</div>
			) : null}
		</article>
	);
}
