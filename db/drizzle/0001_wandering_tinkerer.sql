CREATE TABLE `sett_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`volume_template_id` integer,
	`weight` real,
	`reps` integer,
	`rpe` real,
	`index` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`volume_template_id`) REFERENCES `volume_templates`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `volume_template_id_index` ON `sett_templates` (`volume_template_id`);--> statement-breakpoint
CREATE INDEX `sett_template_index_index` ON `sett_templates` (`index`);--> statement-breakpoint
CREATE TABLE `volume_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_template_id` integer,
	`exercise_id` integer,
	`notes` text,
	`index` integer NOT NULL,
	`sub_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`workout_template_id`) REFERENCES `workout_templates`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workout_template_id_index` ON `volume_templates` (`workout_template_id`);--> statement-breakpoint
CREATE INDEX `volume_template_index_index` ON `volume_templates` (`index`);--> statement-breakpoint
CREATE TABLE `workout_templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `setts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`volume_id` integer,
	`weight` real NOT NULL,
	`reps` integer NOT NULL,
	`rpe` real,
	`index` integer NOT NULL,
	`type` text NOT NULL,
	FOREIGN KEY (`volume_id`) REFERENCES `volumes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `volume_id_index` ON `setts` (`volume_id`);--> statement-breakpoint
CREATE INDEX `sett_index_index` ON `setts` (`index`);--> statement-breakpoint
CREATE TABLE `volumes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_id` integer,
	`exercise_id` integer,
	`notes` text,
	`index` integer NOT NULL,
	`sub_index` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workout_id_index` ON `volumes` (`workout_id`);--> statement-breakpoint
CREATE INDEX `volume_index_index` ON `volumes` (`index`);--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`notes` text,
	`date` integer NOT NULL
);
