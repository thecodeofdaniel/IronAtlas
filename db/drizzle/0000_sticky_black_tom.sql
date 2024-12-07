CREATE TABLE `exercises` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`index` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `exercise_tags` (
	`exercise_id` integer NOT NULL,
	`tag_id` integer NOT NULL,
	PRIMARY KEY(`exercise_id`, `tag_id`),
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`tag_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`value` text NOT NULL,
	`parent_id` integer,
	`index` integer NOT NULL,
	`is_open` integer NOT NULL,
	FOREIGN KEY (`parent_id`) REFERENCES `tags`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `routines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `routines_name_unique` ON `routines` (`name`);--> statement-breakpoint
CREATE TABLE `sett_routines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`volume_routine_id` integer,
	`type` text NOT NULL,
	`weight` real,
	`reps` integer,
	`index` integer NOT NULL,
	FOREIGN KEY (`volume_routine_id`) REFERENCES `volume_routines`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `volume_routine_id_index` ON `sett_routines` (`volume_routine_id`);--> statement-breakpoint
CREATE INDEX `sett_rountine_index_index` ON `sett_routines` (`index`);--> statement-breakpoint
CREATE TABLE `volume_routines` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`routine_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`index` integer NOT NULL,
	`sub_index` integer,
	FOREIGN KEY (`routine_id`) REFERENCES `routines`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `routine_id_index` ON `volume_routines` (`routine_id`);--> statement-breakpoint
CREATE INDEX `volume_routine_index_index` ON `volume_routines` (`index`);--> statement-breakpoint
CREATE INDEX `volume_routine_sub_index_index` ON `volume_routines` (`sub_index`);--> statement-breakpoint
CREATE TABLE `setts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`volume_id` integer NOT NULL,
	`type` text NOT NULL,
	`weight` real NOT NULL,
	`reps` integer NOT NULL,
	`index` integer NOT NULL,
	FOREIGN KEY (`volume_id`) REFERENCES `volumes`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `volume_id_index` ON `setts` (`volume_id`);--> statement-breakpoint
CREATE INDEX `sett_index_index` ON `setts` (`index`);--> statement-breakpoint
CREATE TABLE `volumes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`workout_id` integer NOT NULL,
	`exercise_id` integer NOT NULL,
	`index` integer NOT NULL,
	`sub_index` integer,
	FOREIGN KEY (`workout_id`) REFERENCES `workouts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`exercise_id`) REFERENCES `exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `workout_id_index` ON `volumes` (`workout_id`);--> statement-breakpoint
CREATE INDEX `volume_index_index` ON `volumes` (`index`);--> statement-breakpoint
CREATE INDEX `volume_sub_index_index` ON `volumes` (`sub_index`);--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`notes` text,
	`date` integer NOT NULL,
	`duration` integer NOT NULL
);
