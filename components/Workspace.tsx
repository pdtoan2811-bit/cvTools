"use client";

import { useEffect, useState } from "react";
import CvEditor from "./editor/CvEditor";
import { loadLocal } from "@/lib/local-store";
import { decodeCv, payloadFromHash } from "@/lib/share";
import type { CvData } from "@/lib/types";

/**
 * Decides which CV the editor opens, in order:
 *   1. a `#cv=…` payload — someone shared their CV with this browser
 *   2. the working copy saved in this browser
 *   3. the CV that ships with the app
 *
 * Nothing here needs a server, which is why the app is usable the first time
 * it loads rather than after a setup step.
 */
export default function Workspace({ seed }: { seed: CvData }) {
  const [data, setData] = useState<CvData | null>(null);
  const [source, setSource] = useState<"shared" | "local" | "seed">("seed");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const payload = payloadFromHash();
      if (payload) {
        const shared = await decodeCv(payload);
        if (shared && !cancelled) {
          setData(shared);
          setSource("shared");
          // Drop the payload from the address bar: it is long, and the editor
          // saves to this browser from here on.
          history.replaceState(null, "", window.location.pathname);
          return;
        }
      }
      if (cancelled) return;
      const local = loadLocal();
      setData(local ?? seed);

      // "Edit a copy" on a shared CV lands here; say so, once.
      let forked = false;
      try {
        forked = sessionStorage.getItem("cvtools:just-forked") === "1";
        if (forked) sessionStorage.removeItem("cvtools:just-forked");
      } catch {
        /* private mode */
      }
      setSource(forked ? "shared" : local ? "local" : "seed");
    })();

    return () => {
      cancelled = true;
    };
  }, [seed]);

  if (!data) {
    return (
      <div className="boot">
        <span className="boot-dot" />
        Opening your CV…
      </div>
    );
  }

  return <CvEditor initial={data} source={source} />;
}
