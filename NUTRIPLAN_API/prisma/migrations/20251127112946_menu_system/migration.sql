-- CreateTable
CREATE TABLE "WeeklyMenu" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "weekMenuId" TEXT NOT NULL,
    "day" "DayEnum" NOT NULL,
    "mainDish" TEXT NOT NULL,
    "sideDish" TEXT NOT NULL,
    "vegetable" TEXT NOT NULL,
    "fruit" TEXT NOT NULL,
    "drink" TEXT NOT NULL,
    "calories" INTEGER,
    "protein" TEXT,
    "carbs" TEXT,
    "fat" TEXT,
    "portionCount" INTEGER NOT NULL DEFAULT 150,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuIngredient" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "ingredient" TEXT NOT NULL,
    "quantity" TEXT,
    "unit" TEXT,

    CONSTRAINT "MenuIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuAllergen" (
    "id" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,

    CONSTRAINT "MenuAllergen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoodMenu" (
    "id" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "mainDish" TEXT NOT NULL,
    "sideDish" TEXT NOT NULL,
    "vegetable" TEXT NOT NULL,
    "fruit" TEXT NOT NULL,
    "drink" TEXT NOT NULL,
    "calories" INTEGER,
    "protein" TEXT,
    "carbs" TEXT,
    "fat" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GoodMenu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuIngredientGood" (
    "id" TEXT NOT NULL,
    "goodMenuId" TEXT NOT NULL,
    "ingredient" TEXT NOT NULL,
    "quantity" TEXT,
    "unit" TEXT,

    CONSTRAINT "MenuIngredientGood_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuAllergenGood" (
    "id" TEXT NOT NULL,
    "goodMenuId" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,

    CONSTRAINT "MenuAllergenGood_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WeeklyMenu" ADD CONSTRAINT "WeeklyMenu_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_weekMenuId_fkey" FOREIGN KEY ("weekMenuId") REFERENCES "WeeklyMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuIngredient" ADD CONSTRAINT "MenuIngredient_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuAllergen" ADD CONSTRAINT "MenuAllergen_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "MenuItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuIngredientGood" ADD CONSTRAINT "MenuIngredientGood_goodMenuId_fkey" FOREIGN KEY ("goodMenuId") REFERENCES "GoodMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuAllergenGood" ADD CONSTRAINT "MenuAllergenGood_goodMenuId_fkey" FOREIGN KEY ("goodMenuId") REFERENCES "GoodMenu"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
