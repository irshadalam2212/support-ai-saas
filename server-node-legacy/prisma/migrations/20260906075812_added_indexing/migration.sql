-- CreateIndex
CREATE INDEX `RefreshToken_familyId_idx` ON `RefreshToken`(`familyId`);

-- CreateIndex
CREATE INDEX `RefreshToken_expiresAt_idx` ON `RefreshToken`(`expiresAt`);

-- RenameIndex
ALTER TABLE `RefreshToken` RENAME INDEX `RefreshToken_userId_fkey` TO `RefreshToken_userId_idx`;
