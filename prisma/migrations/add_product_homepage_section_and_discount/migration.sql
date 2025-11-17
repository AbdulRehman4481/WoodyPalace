-- CreateEnum
CREATE TYPE "HomePageSection" AS ENUM ('BEST_SELLERS', 'LATEST_DEALS', 'TRENDING_THIS_WEEK', 'TOP_SELLING_PRODUCTS');

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "homePageSection" "HomePageSection",
ADD COLUMN     "discountPercentage" DECIMAL(5,2);

