import { requireUser } from "@/lib/auth/session";
import { signOut } from "./actions";

export default async function AccountPage() {
  const user = await requireUser();

  return (
    <section className="section">
      <div className="panel stack">
        <p className="eyebrow">Session</p>
        <h1>Account</h1>
        <p className="lead">
          Signed in as {user.email ?? "Google user"}.
        </p>
        <form action={signOut}>
          <button className="button secondary" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </section>
  );
}
