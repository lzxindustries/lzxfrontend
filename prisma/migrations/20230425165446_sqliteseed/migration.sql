-- CreateTable
CREATE TABLE "Patch" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Patch_email_key" ON "Patch"("email");
