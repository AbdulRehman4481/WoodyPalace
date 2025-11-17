-- CreateEnum
CREATE TYPE "BannerType" AS ENUM ('NEW_ARRIVAL', 'DISCOUNT', 'COMING_SOON');

-- CreateTable
CREATE TABLE "banners" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT NOT NULL,
    "type" "BannerType" NOT NULL,
    "bannerColor" TEXT DEFAULT '#FFFFFF',
    "titleColor" TEXT DEFAULT '#000000',
    "descriptionColor" TEXT DEFAULT '#666666',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "banners_pkey" PRIMARY KEY ("id")
);

