CREATE TABLE IF NOT EXISTS utilisateurs (
	pseudo TEXT PRIMARY KEY,
	pass TEXT NOT NULL,
    roles JSONB DEFAULT '[]',
	createdat TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	agl INTEGER NOT NULL DEFAULT 0 CHECK (agl >= 0)
);

CREATE TABLE IF NOT EXISTS matchs (
	id BIGSERIAL PRIMARY KEY,
	titre TEXT NOT NULL,
	informations TEXT NOT NULL,
	equipes JSONB NOT NULL,
	phase TEXT NOT NULL DEFAULT 'en attente' CHECK (phase IN ('en attente', 'ouvert', 'fermé')),
	statut TEXT NOT NULL DEFAULT 'en attente',
	participants INTEGER NOT NULL DEFAULT 0 CHECK (participants >= 0),
	agl INTEGER NOT NULL DEFAULT 0 CHECK (agl >= 0)
);

-- Migration : remplace les dates d'ouverture/fermeture par la phase manuelle
DO $$
BEGIN
	IF EXISTS (SELECT 1 FROM information_schema.columns
		WHERE table_name = 'matchs' AND column_name = 'ouverture') THEN
		ALTER TABLE matchs ADD COLUMN phase TEXT NOT NULL DEFAULT 'en attente'
			CHECK (phase IN ('en attente', 'ouvert', 'fermé'));
		UPDATE matchs SET phase = CASE
			WHEN fermeture <= now() THEN 'fermé'
			WHEN ouverture <= now() THEN 'ouvert'
			ELSE 'en attente'
		END;
		ALTER TABLE matchs DROP COLUMN ouverture, DROP COLUMN fermeture;
	END IF;
END $$;

CREATE TABLE IF NOT EXISTS paris (
	id BIGSERIAL PRIMARY KEY,
	pseudo TEXT NOT NULL REFERENCES utilisateurs(pseudo) ON DELETE CASCADE,
	agl INTEGER NOT NULL CHECK (agl > 0),
	match BIGINT NOT NULL REFERENCES matchs(id) ON DELETE CASCADE,
	equipe TEXT NOT NULL,
	at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transactions (
	id BIGSERIAL PRIMARY KEY,
	pseudo TEXT NOT NULL REFERENCES utilisateurs(pseudo) ON DELETE CASCADE,
	agl INTEGER NOT NULL,
	raison TEXT NOT NULL,
	at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS retraits (
	id BIGSERIAL PRIMARY KEY,
	pseudo TEXT NOT NULL REFERENCES utilisateurs(pseudo) ON DELETE CASCADE,
	agl INTEGER NOT NULL CHECK (agl > 0),
	effectif BOOLEAN NOT NULL DEFAULT FALSE,
	at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_matchs_statut
	ON matchs (statut);

CREATE INDEX IF NOT EXISTS idx_paris_match
	ON paris (match);

CREATE INDEX IF NOT EXISTS idx_paris_pseudo
	ON paris (pseudo);

CREATE INDEX IF NOT EXISTS idx_paris_pseudo_match
	ON paris (pseudo, match);

CREATE INDEX IF NOT EXISTS idx_transactions_pseudo_at
	ON transactions (pseudo, at DESC);

CREATE INDEX IF NOT EXISTS idx_retraits_pseudo_at
	ON retraits (pseudo, at DESC);
