-- CreateTable
CREATE TABLE "invoice_history" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "field" TEXT,
    "itemId" TEXT,
    "oldValue" JSONB,
    "newValue" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoice_history_invoiceId_idx" ON "invoice_history"("invoiceId");

-- CreateIndex
CREATE INDEX "invoice_history_userId_idx" ON "invoice_history"("userId");

-- AddForeignKey
ALTER TABLE "invoice_history" ADD CONSTRAINT "invoice_history_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_history" ADD CONSTRAINT "invoice_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
