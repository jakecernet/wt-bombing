import "./App.css";
import "./styles/shared.css";
import "./styles/nav.css";
import "./styles/home.css";
import "./styles/planes.css";
import "./styles/plane-card.css";
import "./styles/bombs.css";
import "./styles/plane-page.css";
import NavIcon from "./favicon.svg";
import { Menu, Sun, Moon, Search, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import PlaneCard from "./components/PlaneCard";
import BombCard from "./components/BombCard";
import PlanePage from "./components/PlanePage";
import { planeIconSrc } from "./components/PlaneCard";
import {
	PLANES,
	ALL_BOMBS,
	MAX_BASES,
	ALL_BRS,
	COUNTRIES,
} from "./data/planes";

const SHEET_URL =
	"https://docs.google.com/spreadsheets/d/1oNwp_MXszU5J2dcaz5IoCtSAQ-infPdOWhwtJXqtrwU/edit";

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];
const RANKS = [...new Set(PLANES.map((p) => p.rank))].sort((a, b) => a - b);

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

const SORTS = {
	bases: (a, b) => b.bases - a.bases || b.reward - a.reward,
	reward: (a, b) => b.reward - a.reward || b.bases - a.bases,
	br: (a, b) => a.br - b.br || b.bases - a.bases,
	name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }),
};

const NO_BOMBS = new Set();

// tiny hash router: #/  #/planes  #/bombs  #/plane/<id>
const parseHash = () => {
	const [view = "", id] = window.location.hash
		.replace(/^#\/?/, "")
		.split("/");
	return { view: view || "home", id: id ? decodeURIComponent(id) : null };
};

function BrSelect({ value, onChange }) {
	return (
		<select
			value={value ?? ""}
			onChange={(e) =>
				onChange(e.target.value ? Number(e.target.value) : null)
			}>
			<option value="">Any (show both rows)</option>
			{ALL_BRS.map((b) => (
				<option key={b} value={b}>
					{b.toFixed(1)}
				</option>
			))}
		</select>
	);
}

function App() {
	const [navActive, setNavActive] = useState(true);
	const [theme, setTheme] = useState(
		() => localStorage.getItem("theme") || "dark",
	);
	const [route, setRoute] = useState(parseHash);
	const view = route.view; // home | planes | bombs | plane
	const current =
		view === "plane" ? PLANES.find((p) => p.id === route.id) : null;

	const [query, setQuery] = useState("");
	const [suggestOpen, setSuggestOpen] = useState(false);
	const [battleBr, setBattleBr] = useState(null);

	// planes tab
	const [pQuery, setPQuery] = useState("");
	const [rank, setRank] = useState("all");
	const [country, setCountry] = useState("all");
	const [minBases, setMinBases] = useState(0);
	const [sort, setSort] = useState("bases");

	const inputRef = useRef(null);

	const isMobile = window.innerWidth <= 768;

	useEffect(() => {
		if (isMobile) setNavActive(false);
	}, [isMobile]);

	useEffect(() => {
		localStorage.setItem("theme", theme);
		document.documentElement.setAttribute("data-theme", theme);
		document.documentElement.style.colorScheme = theme;
	}, [theme]);

	useEffect(() => {
		const onHash = () => {
			setRoute(parseHash());
			window.scrollTo({ top: 0 });
		};
		window.addEventListener("hashchange", onHash);
		return () => window.removeEventListener("hashchange", onHash);
	}, []);

	const go = (v) => {
		window.location.hash = v === "home" ? "#/" : `#/${v}`;
		if (isMobile) setNavActive(false);
	};

	// open a plane's info page (used by cards, search and the bomb list)
	const openPlane = (plane) => {
		setSuggestOpen(false);
		window.location.hash = `#/plane/${encodeURIComponent(plane.id)}`;
		if (isMobile) setNavActive(false);
	};

	const q = norm(query);
	const suggestions = PLANES.filter(
		(p) => !q || norm(p.name).includes(q),
	).slice(0, 8);

	const pq = norm(pQuery);
	const planes = PLANES.filter((p) => {
		if (pq && !norm(p.name).includes(pq)) return false;
		if (country !== "all" && p.country !== country) return false;
		if (rank !== "all" && p.rank !== rank) return false;
		return p.bases >= minBases;
	}).sort(SORTS[sort]);
	const planesFiltered =
		pq || rank !== "all" || country !== "all" || minBases > 0;

	const submit = (e) => {
		e.preventDefault();
		const exact = PLANES.find((p) => norm(p.name) === q) ?? suggestions[0];
		if (exact && q) openPlane(exact);
	};

	const navItem = (v, label) => (
		<li
			className={
				view === v || (v === "planes" && view === "plane")
					? "current"
					: ""
			}
			onClick={() => go(v)}>
			{label}
		</li>
	);

	return (
		<div className="container">
			<nav>
				<div className="logo" onClick={() => go("home")}>
					<img src={NavIcon} alt="Logo" />
					<h1>WT bombing chart</h1>
				</div>
				<div className={`nav-links${navActive ? " active" : ""}`}>
					<ul>
						{navItem("home", "Home")}
						{navItem("planes", "Planes")}
						{navItem("bombs", "Bombs")}
						<li>
							<Sun
								onClick={() => setTheme("dark")}
								className={
									theme === "light" ? "active" : "hidden"
								}
							/>
							<Moon
								onClick={() => setTheme("light")}
								className={
									theme === "dark" ? "active" : "hidden"
								}
							/>
						</li>
					</ul>
				</div>
				<div
					className="burger"
					onClick={() => setNavActive(!navActive)}>
					<Menu></Menu>
				</div>
			</nav>

			{view === "home" ? (
				<>
					<header>
						<h2>Want to know how many bases you can destroy?</h2>
						<form className="search" onSubmit={submit}>
							<input
								ref={inputRef}
								type="text"
								placeholder="Plane name"
								value={query}
								onChange={(e) => {
									setQuery(e.target.value);
									setSuggestOpen(true);
								}}
								onFocus={() => setSuggestOpen(true)}
								onBlur={() => setSuggestOpen(false)}
								aria-label="Plane name"
								autoComplete="off"
							/>
							<button type="submit" aria-label="Search">
								<Search />
							</button>
							{suggestOpen && suggestions.length > 0 ? (
								<div className="results" role="listbox">
									{suggestions.map((p) => (
										<button
											type="button"
											role="option"
											key={p.id}
											// keep focus in the input so onBlur doesn't swallow the click
											onMouseDown={(e) =>
												e.preventDefault()
											}
											onClick={() => openPlane(p)}>
											<img
												className="result-icon"
												src={planeIconSrc(p)}
												alt=""
												loading="lazy"
												onError={(e) =>
													(e.currentTarget.style.visibility =
														"hidden")
												}
											/>
											<span className="result-name">
												{p.name}
											</span>
											<small>
												{p.country} · BR{" "}
												{p.br.toFixed(1)} · {p.bases}{" "}
												{p.bases === 1
													? "base"
													: "bases"}
											</small>
										</button>
									))}
								</div>
							) : null}
						</form>
					</header>

					<main>
						<p className="hint">
							Search for a plane and pick it from the list to see
							its loadout, bases and reward multiplier.
						</p>
					</main>
				</>
			) : null}

			{view === "planes" ? (
				<main className="page">
					<h2 className="page-title">Planes</h2>
					<section className="filters">
						<div className="filter-group">
							<h3>Name</h3>
							<input
								className="text"
								type="text"
								placeholder="Filter planes"
								value={pQuery}
								onChange={(e) => setPQuery(e.target.value)}
							/>
						</div>
						<div className="filter-group">
							<h3>Nation</h3>
							<div
								className="segmented"
								role="group"
								aria-label="Nation">
								{[
									["all", "All"],
									...COUNTRIES.map((c) => [c, c]),
								].map(([v, label]) => (
									<button
										key={v}
										className={country === v ? "on" : ""}
										onClick={() => setCountry(v)}>
										{label}
									</button>
								))}
							</div>
						</div>
						<div className="filter-group">
							<h3>Rank</h3>
							<div
								className="segmented"
								role="group"
								aria-label="Rank">
								{[
									["all", "All"],
									...RANKS.map((r) => [r, ROMAN[r]]),
								].map(([v, label]) => (
									<button
										key={v}
										className={rank === v ? "on" : ""}
										onClick={() => setRank(v)}>
										{label}
									</button>
								))}
							</div>
						</div>
						<div className="filter-group">
							<h3>
								Min. bases{" "}
								<span className="val">{minBases}</span>
							</h3>
							<input
								type="range"
								min="0"
								max={MAX_BASES}
								value={minBases}
								onChange={(e) =>
									setMinBases(Number(e.target.value))
								}
								aria-label="Minimum bases destroyed"
							/>
						</div>
						<div className="filter-group">
							<h3>Battle BR</h3>
							<BrSelect value={battleBr} onChange={setBattleBr} />
						</div>
						<div className="filter-group">
							<h3>Sort by</h3>
							<select
								value={sort}
								onChange={(e) => setSort(e.target.value)}>
								<option value="bases">Most bases</option>
								<option value="reward">
									Best reward multiplier
								</option>
								<option value="br">Lowest BR</option>
								<option value="name">Name</option>
							</select>
						</div>
					</section>

					<section className="planes">
						<div className="planes-head">
							<p>
								<strong>{planes.length}</strong> of{" "}
								{PLANES.length} planes · {COUNTRIES.join(", ")}
							</p>
							{planesFiltered ? (
								<button
									className="clear"
									onClick={() => {
										setPQuery("");
										setRank("all");
										setCountry("all");
										setMinBases(0);
									}}>
									<X size={14} /> Clear filters
								</button>
							) : null}
						</div>
						{planes.length ? (
							<div className="grid">
								{planes.map((p) => (
									<PlaneCard
										key={p.id}
										plane={p}
										onOpen={openPlane}
										selected={NO_BOMBS}
										maxBases={MAX_BASES}
										battleBr={battleBr}
									/>
								))}
							</div>
						) : (
							<div className="empty">
								<p>No planes match these filters.</p>
							</div>
						)}
					</section>
				</main>
			) : null}

			{view === "plane" ? (
				current ? (
					<PlanePage
						key={current.id}
						plane={current}
						battleBr={battleBr}
						onBattleBr={setBattleBr}
						onBack={() =>
							window.history.length > 1
								? window.history.back()
								: go("planes")
						}
					/>
				) : (
					<main className="page">
						<div className="empty">
							<p>Plane not found.</p>
							<button
								className="clear"
								onClick={() => go("planes")}>
								Browse planes
							</button>
						</div>
					</main>
				)
			) : null}

			{view === "bombs" ? (
				<main className="page">
					<h2 className="page-title">Bombs</h2>
					<p className="hint left">
						Every bomb found in the chart, with how many planes
						carry it. Open one to see which planes can drop it.
					</p>
					<div className="grid">
						{ALL_BOMBS.map((b) => (
							<BombCard key={b} bomb={b} onPlane={openPlane} />
						))}
					</div>
				</main>
			) : null}

			<footer>
				Data:{" "}
				<a href={SHEET_URL}>
					LEGION&apos;s Loadouts 2.29 – Sky Odyssey
				</a>
				. Germany ranks I–IX and USA ranks I–IX transcribed from
				screenshots; some rows between screenshots may be missing.
			</footer>
		</div>
	);
}

export default App;
