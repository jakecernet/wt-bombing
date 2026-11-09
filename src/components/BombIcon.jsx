import { Bomb } from "lucide-react";
import { BOMBS, iconFile } from "../data/planes";

const base = import.meta.env.BASE_URL;

// Bomb icon looked up through bombs.json (bomb -> icon name -> file). No icon assigned = plain bomb glyph.
export default function BombIcon({ bomb, size = 20 }) {
	const file = iconFile(BOMBS[bomb]?.icon);
	return file ? (
		<img
			className="bomb-icon"
			src={`${base}icons/bombs/${file}`}
			width={size}
			height={size}
			alt=""
			loading="lazy"
		/>
	) : (
		<Bomb size={Math.round(size * 0.7)} />
	);
}
