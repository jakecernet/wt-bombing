import "./App.css";
import NavIcon from "./favicon.svg";

function App() {
	return (
		<div className="container">
			<nav>
                <div className="logo">
                    <img src={NavIcon} alt="Logo" />
                    <h1>WT bombing chart</h1>
                </div>
                <div className="nav-links">
                    <ul>
                        <li>
                            Planes
                        </li>
                        <li>
                            Bombs
                        </li>
                        <li>
                            Search
                        </li>
                    </ul>
                </div>
            </nav>
		</div>
	);
}

export default App;
