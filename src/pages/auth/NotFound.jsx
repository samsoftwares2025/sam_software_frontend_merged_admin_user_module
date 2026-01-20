import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ padding: "4rem", textAlign: "center" }}>
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>

      <Link to="/" style={{ color: "#007bff" }}>
        Go to Login
      </Link>
    </div>
  );
}
