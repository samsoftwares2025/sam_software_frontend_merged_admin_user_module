import { Link } from "react-router-dom";
import "../../assets/styles/notfound.css";

export default function NotFound() {
  return (
    <div className="notfound-wrapper">
      <div className="notfound-card">
        <h1 className="notfound-code">404</h1>
        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-text">
          The page you are looking for doesn’t exist.
        </p>

        <Link to="/" className="notfound-button">
          Go to Login
        </Link>
      </div>
    </div>
  );
}
