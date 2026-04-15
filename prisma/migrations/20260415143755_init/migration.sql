-- CreateEnum
CREATE TYPE "CompanyType" AS ENUM ('geradora', 'destinadora');

-- CreateEnum
CREATE TYPE "WasteClass" AS ENUM ('I', 'II_A', 'II_B');

-- CreateEnum
CREATE TYPE "WasteStatus" AS ENUM ('gerado', 'coletado', 'transportado', 'destinado');

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "corporateName" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "type" "CompanyType" NOT NULL,
    "licenseNumber" TEXT,
    "issuingAgency" TEXT,
    "licenseExpiry" TIMESTAMP(3),
    "acceptedWasteTypes" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Waste" (
    "id" SERIAL NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "class" "WasteClass" NOT NULL,
    "status" "WasteStatus" NOT NULL DEFAULT 'gerado',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),
    "userId" INTEGER NOT NULL,
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Waste_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" SERIAL NOT NULL,
    "toState" "WasteStatus" NOT NULL,
    "notes" TEXT,
    "transporter" TEXT,
    "destinationDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasteId" INTEGER NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MTR" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "transporter" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasteId" INTEGER NOT NULL,
    "destinationId" INTEGER NOT NULL,

    CONSTRAINT "MTR_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_cnpj_key" ON "Company"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "MTR_number_key" ON "MTR"("number");

-- CreateIndex
CREATE UNIQUE INDEX "MTR_wasteId_key" ON "MTR"("wasteId");

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Waste" ADD CONSTRAINT "Waste_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_wasteId_fkey" FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTR" ADD CONSTRAINT "MTR_wasteId_fkey" FOREIGN KEY ("wasteId") REFERENCES "Waste"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MTR" ADD CONSTRAINT "MTR_destinationId_fkey" FOREIGN KEY ("destinationId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
