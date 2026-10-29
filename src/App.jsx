import "./App.css";
import NavIcon from "./images/favicon.svg";
import { Menu, Sun, Moon, Search } from "lucide-react";
import { useState, useEffect } from "react";

function App() {
	const [navActive, setNavActive] = useState(true);

	const isMobile = window.innerWidth <= 768;
	const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");

	useEffect(() => {
		if (isMobile) {
			setNavActive(false);
		}
	}, [isMobile]);

	const setTheme2 = (theme) => {
		localStorage.setItem("theme", theme);
		document.documentElement.setAttribute("data-theme", theme);
	};

	return (
		<div className={`container ${theme}`}>
			<nav>
				<div className="logo">
					<img src={NavIcon} alt="Logo" />
					<h1>WT bombing chart</h1>
				</div>
				<div className={`nav-links${navActive ? " active" : ""}`}>
					<ul>
						<li>Planes</li>
						<li>Bombs</li>
						<li>Search</li>
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
			<header>
				<h2>Want to know how many bases you can destroy?</h2>
				<div className="search">
					<input type="text" placeholder="Plane name" />
                    <button>
                        <Search />
                    </button>
                    <div className="results">
                        
                    </div>
				</div>
			</header>
		</div>
	);
}

export default App;
