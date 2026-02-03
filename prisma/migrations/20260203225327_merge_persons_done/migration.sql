/*
  Warnings:

  - You are about to drop the column `person_id` on the `availability` table. All the data in the column will be lost.
  - You are about to drop the column `person_id` on the `competence_profile` table. All the data in the column will be lost.
  - You are about to drop the `person` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "availability" DROP CONSTRAINT "availability_person_id_fkey";

-- DropForeignKey
ALTER TABLE "competence_profile" DROP CONSTRAINT "competence_profile_person_id_fkey";

-- DropForeignKey
ALTER TABLE "person" DROP CONSTRAINT "person_role_id_fkey";

-- AlterTable
ALTER TABLE "availability" DROP COLUMN "person_id";

-- AlterTable
ALTER TABLE "competence_profile" DROP COLUMN "person_id";

-- DropTable
DROP TABLE "person";
