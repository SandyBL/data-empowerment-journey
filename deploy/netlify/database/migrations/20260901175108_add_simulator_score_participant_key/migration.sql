-- One recorded attempt per person, per simulator, inside a private space.
--
-- A private board is only worth what a client can believe about it, and until
-- now a participant could finish the same exercise five times and let the space
-- record all five. Automatic saving closed the worse half of that -- nobody can
-- choose which attempt gets published any more -- and this closes the rest: the
-- first finished run is the one the board carries, and a replay is practice.
--
-- The rule needs a handle on a person rather than on a browser, so the seat's
-- participant key (SHA-256 of `<space id>:<folded name>`) is copied onto the run
-- at write time. Copied and not joined: `workspace_session_id` is set to NULL
-- when a seat is deleted, and a run whose seat has gone would then stop counting
-- as an attempt, which is a hole in exactly the direction that matters.
--
-- The public board is untouched. Its rows keep a NULL key, the index below
-- excludes them, and a visitor can publish as many runs as they like -- there is
-- no identity out there to enforce anything against, and a typed name is not
-- one: making it one would let anybody take "Maria Silva" out of circulation.
--
-- Nothing is deleted. Runs already on a private board stay on it, including the
-- replays that predate this rule -- a client's leaderboard is not something to
-- rewrite underneath them. Those later runs simply keep a NULL key, so the
-- unique index tolerates them while refusing new ones.

ALTER TABLE "simulator_scores" ADD COLUMN "participant_key" varchar(64);--> statement-breakpoint

-- Attributes the runs already on the private boards, through the seat that
-- published each one. Public rows, and seats that joined before the name was
-- required, have nothing to attribute and stay NULL.
UPDATE "simulator_scores" AS s
SET "participant_key" = ws."participant_key"
FROM "workspace_sessions" AS ws
WHERE s."workspace_session_id" = ws."id"
  AND s."workspace_id" IS NOT NULL
  AND ws."participant_key" IS NOT NULL;--> statement-breakpoint

-- Keeps the key on each person's earliest run per simulator and drops it from
-- the rest, so the unique index can be created over boards that already contain
-- replays. Earliest by created_at with the id as the tie breaker for rows written
-- in the same instant, which is the same "first attempt" the endpoint now
-- enforces going forward.
UPDATE "simulator_scores" AS s
SET "participant_key" = NULL
WHERE s."participant_key" IS NOT NULL
  AND s."id" <> (
    SELECT f."id"
    FROM "simulator_scores" AS f
    WHERE f."workspace_id" = s."workspace_id"
      AND f."simulator" = s."simulator"
      AND f."participant_key" = s."participant_key"
    ORDER BY f."created_at" ASC, f."id" ASC
    LIMIT 1
  );--> statement-breakpoint

CREATE UNIQUE INDEX "simulator_scores_space_simulator_participant_idx" ON "simulator_scores" ("workspace_id","simulator","participant_key") WHERE "workspace_id" is not null and "participant_key" is not null;
