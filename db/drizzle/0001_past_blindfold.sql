CREATE INDEX `volume_template_sub_index_index` ON `volume_templates` (`sub_index`);--> statement-breakpoint
ALTER TABLE `volume_templates` DROP COLUMN `notes`;--> statement-breakpoint
CREATE UNIQUE INDEX `workout_templates_name_unique` ON `workout_templates` (`name`);--> statement-breakpoint
ALTER TABLE `workout_templates` DROP COLUMN `notes`;--> statement-breakpoint
ALTER TABLE `sett_templates` DROP COLUMN `rpe`;