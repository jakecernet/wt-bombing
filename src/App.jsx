import "./App.css";
import NavIcon from "./images/favicon.svg";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";

function App() {
    const [navActive, setNavActive] = useState(true);

    const isMobile = window.innerWidth <= 768;

    useEffect(() => {
        if (isMobile) {
            setNavActive(false);
        }
    }, [isMobile]);

	return (
		<div className="container">
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
					</ul>
				</div>
				<div className="burger" onClick={() => setNavActive(!navActive)}>
					<Menu></Menu>
				</div>
			</nav>
		</div>
	);
}

export default App;
