import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/styles/main.css";
import AppRoutes from "./routes";
import logo from "./assets/images/logo.png";

function App() {
  return (
    <div className="app-container">
      <img src={logo} alt="Logo" className="logo" />
      <AppRoutes />
    </div>
  );
}

export default App;
