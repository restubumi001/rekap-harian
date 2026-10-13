import { PocketIc, createIdentity } from "@dfinity/pic";
import type { Actor, CanisterFixture } from "@dfinity/pic";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";
// Set only on a converted project: the last pre-EM revision, whose schema this
// app's migration chain replays from. Installing the current wasm onto an empty
// canister there traps IC0503 before any test runs.
const BASELINE_WASM = process.env.BACKEND_WASM_BASELINE;

// The canister's write methods are gated by `canWrite`, which rejects the
// anonymous principal and any principal without a role. The first principal to
// call `_initialize_access_control` becomes admin, so the lane installs as a
// deterministic identity and registers it before any write.
const alice = createIdentity("alice");

// The declarations' `RecapFilter` has every field required, each an optional
// (`[] | [T]`). A bare `{}` fails Candid encoding with
// `Record is missing key "status"`, so every read passes the full shape.
const EMPTY_FILTER = {
  status: [],
  endDate: [],
  kind: [],
  search: [],
  startDate: [],
} as const;

let pic: PocketIc | undefined;
let actor: Actor<_SERVICE>;
let canisterId: CanisterFixture<_SERVICE>["canisterId"];

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  if (BASELINE_WASM === undefined) {
    ({ actor, canisterId } = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BACKEND_WASM,
      sender: alice.getPrincipal(),
    }));
  } else {
    // `[baseline, current]`, the same install contract the hosted deploy uses for
    // a converted project. The upgrade replays the chain from the legacy schema.
    const installed = await pic.setupCanister<_SERVICE>({
      idlFactory,
      wasm: BASELINE_WASM,
      sender: alice.getPrincipal(),
    });
    await pic.upgradeCanister({ canisterId: installed.canisterId, wasm: BACKEND_WASM, arg: new Uint8Array() });
    ({ actor, canisterId } = installed);
  }
  actor.setIdentity(alice);
  await actor._initialize_access_control();
});

afterAll(async () => {
  // `?.` because `beforeAll` may not have got that far. A failed
  // `PocketIc.create` otherwise stacks "Cannot read properties of undefined"
  // on top of the real error and buries the one line that explains the run.
  await pic?.tearDown();
});

it("answers an empty-state read instead of trapping", async () => {
  await expect(actor.listRecaps()).resolves.toEqual([]);
  await expect(actor.listItems()).resolves.toEqual([]);
});

it("round-trips an item and a recap through the real canister", async () => {
  const item = await actor.addItem({ name: "Nasi putih", kind: { rice: null } });
  expect(item).toHaveProperty("ok");
  if (!("ok" in item)) return;

  const recap = await actor.addRecap({
    itemId: item.ok.id,
    date: "2026-10-13",
    available: 100n,
    used: 80n,
  });
  expect(recap).toHaveProperty("ok");
  if (!("ok" in recap)) return;
  expect(recap.ok.difference).toBe(20n);
  expect(recap.ok.status).toEqual({ surplus: null });

  const shortfall = await actor.addRecap({
    itemId: item.ok.id,
    date: "2026-10-14",
    available: 50n,
    used: 65n,
  });
  expect(shortfall).toHaveProperty("ok");
  if (!("ok" in shortfall)) return;
  expect(shortfall.ok.difference).toBe(-15n);
  expect(shortfall.ok.status).toEqual({ shortfall: null });

  const recaps = await actor.filterRecaps(EMPTY_FILTER, { dateAsc: null });
  expect(recaps).toHaveLength(2);
});

it("summarizes surplus and shortfall across the period", async () => {
  const summary = await actor.recapSummary(EMPTY_FILTER);
  expect(summary.totalSurplus).toBe(20n);
  expect(summary.totalShortfall).toBe(15n);
  expect(summary.surplusCount).toBe(1n);
  expect(summary.shortfallCount).toBe(1n);
});

it("rejects an anonymous caller", async () => {
  // A freshly created actor calls as the anonymous principal until an identity is set.
  const guest = pic!.createActor<_SERVICE>(idlFactory, canisterId);
  // The backend reports the refusal as an error result, not a trap.
  await expect(guest.addRecap({ itemId: 0n, date: "2026-10-13", available: 1n, used: 1n })).resolves.toEqual({
    err: { notAuthorized: null },
  });
});
