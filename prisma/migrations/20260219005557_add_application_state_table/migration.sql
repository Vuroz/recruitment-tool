-- CreateTable
CREATE TABLE "application_state" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "state_id" INTEGER NOT NULL,

    CONSTRAINT "application_state_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "application_state" ADD CONSTRAINT "application_state_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
