import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell">
      <h2>Nothing here</h2>
      <p className="sub">
        This CV does not exist, or its link has changed. Ask whoever shared it for the current
        link.
      </p>
      <Link className="btn" href="/">
        Go to the start
      </Link>
    </div>
  );
}
