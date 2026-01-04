ALTER TABLE `orders` ADD `cjOrderId` varchar(64);--> statement-breakpoint
ALTER TABLE `orders` ADD `cjSyncStatus` enum('pending','synced','failed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `orders` ADD `cjSyncedAt` timestamp;--> statement-breakpoint
ALTER TABLE `orders` ADD `cjSyncError` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `orders` ADD `trackingUrl` text;