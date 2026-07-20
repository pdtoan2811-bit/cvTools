import Workspace from "@/components/Workspace";
import { MINH } from "@/lib/seed-minh";

/**
 * The whole app. Opening the deployment drops you straight into the editor
 * with a real CV loaded — there is nothing to create and nothing to configure.
 */
export default function Home() {
  return <Workspace seed={MINH} />;
}
