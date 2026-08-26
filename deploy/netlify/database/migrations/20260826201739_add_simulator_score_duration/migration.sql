-- Adds the run duration the simulator leaderboards now rank ties on.
--
-- Two boards (Data Literacy and Data Ownership Conflict) time how long a player
-- takes to answer every question, and equal scores are ordered fastest first.
--
-- Nullable rather than defaulted to zero: rows already on the boards were played
-- untimed, and a default of zero would hand every one of them the best possible
-- tie break. NULL sorts last under `ORDER BY duration_ms ASC`, so an untimed run
-- keeps its score and simply loses ties to a timed one.
ALTER TABLE "simulator_scores" ADD COLUMN "duration_ms" integer;
