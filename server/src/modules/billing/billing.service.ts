import { and, desc, eq, isNotNull, sql } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { billingSchedules, companies, invoices, orders, quotations } from '../../db/schema/dealflow.js';

export class BillingService {
  static async getInvoiceOverview() {
    const invoiceRows = await db
      .select({
        id: invoices.id,
        invoiceNumber: sql<string>`'INV-' || substr(${invoices.id}::text, 1, 8)`,
        customerName: companies.name,
        amount: billingSchedules.amount,
        status: invoices.status,
        dueAt: invoices.dueAt,
        orderId: orders.id,
      })
      .from(invoices)
      .leftJoin(billingSchedules, eq(invoices.billingId, billingSchedules.id))
      .leftJoin(orders, eq(billingSchedules.orderId, orders.id))
      .leftJoin(quotations, eq(orders.quotationId, quotations.id))
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .orderBy(desc(invoices.dueAt));

    const summary = {
      totalInvoices: invoiceRows.length,
      paidInvoices: invoiceRows.filter((invoice) => invoice.status === 'paid').length,
      overdueInvoices: invoiceRows.filter((invoice) => invoice.status === 'overdue').length,
      draftInvoices: invoiceRows.filter((invoice) => invoice.status === 'draft').length,
      totalOutstanding: invoiceRows.reduce((sum, invoice) => sum + (invoice.status !== 'paid' ? Number(invoice.amount || 0) : 0), 0),
    };

    return {
      summary,
      invoices: invoiceRows.map((invoice) => ({
        ...invoice,
        amount: Number(invoice.amount || 0),
        customerName: invoice.customerName || 'Unknown Customer',
      })),
    };
  }

  static async getInvoiceById(id: string) {
    const [invoice] = await db
      .select({
        id: invoices.id,
        invoiceNumber: sql<string>`'INV-' || substr(${invoices.id}::text, 1, 8)`,
        customerName: companies.name,
        amount: billingSchedules.amount,
        status: invoices.status,
        dueAt: invoices.dueAt,
        orderId: orders.id,
      })
      .from(invoices)
      .leftJoin(billingSchedules, eq(invoices.billingId, billingSchedules.id))
      .leftJoin(orders, eq(billingSchedules.orderId, orders.id))
      .leftJoin(quotations, eq(orders.quotationId, quotations.id))
      .leftJoin(companies, eq(quotations.customerId, companies.id))
      .where(eq(invoices.id, id));

    return invoice || null;
  }
}
