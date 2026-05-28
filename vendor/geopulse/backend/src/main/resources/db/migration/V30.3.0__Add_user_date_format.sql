-- Add user date format preference for UI date display (e.g. MDY, DMY, YMD)

ALTER TABLE users ADD COLUMN date_format VARCHAR(16);
