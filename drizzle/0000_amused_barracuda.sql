CREATE TABLE `ad_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`channel` text NOT NULL,
	`investment` real DEFAULT 0 NOT NULL,
	`leads` integer DEFAULT 0 NOT NULL,
	`sales` integer DEFAULT 0 NOT NULL,
	`revenue` real DEFAULT 0 NOT NULL,
	`profit` real DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_ad_metrics_month_channel` ON `ad_metrics` (`month`,`channel`);--> statement-breakpoint
CREATE TABLE `goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`month` text NOT NULL,
	`sales_target` integer DEFAULT 5 NOT NULL,
	`revenue_target` real DEFAULT 0 NOT NULL,
	`profit_target` real DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `goals_month_unique` ON `goals` (`month`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text DEFAULT '' NOT NULL,
	`source` text DEFAULT 'manual' NOT NULL,
	`motorcycle_id` integer,
	`stage` text DEFAULT 'novo' NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`follow_up_at` text,
	`sale_value` real,
	`profit` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`motorcycle_id`) REFERENCES `motorcycles`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_leads_stage` ON `leads` (`stage`);--> statement-breakpoint
CREATE INDEX `idx_leads_follow_up_at` ON `leads` (`follow_up_at`);--> statement-breakpoint
CREATE TABLE `motorcycles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`version` text DEFAULT '' NOT NULL,
	`year` integer NOT NULL,
	`mileage` integer DEFAULT 0 NOT NULL,
	`engine` text DEFAULT '' NOT NULL,
	`color` text DEFAULT '' NOT NULL,
	`purchase_price` real,
	`minimum_price` real,
	`sale_price` real,
	`asking_price` real,
	`ownership` text DEFAULT 'propria' NOT NULL,
	`status` text DEFAULT 'disponivel' NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`published` integer DEFAULT true NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`features` text DEFAULT '[]' NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`acquired_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`sold_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `motorcycles_slug_unique` ON `motorcycles` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_motorcycles_status_published` ON `motorcycles` (`status`,`published`);--> statement-breakpoint
CREATE INDEX `idx_motorcycles_acquired_at` ON `motorcycles` (`acquired_at`);
--> statement-breakpoint
PRAGMA optimize;
