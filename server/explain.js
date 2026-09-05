import pg from 'pg';
import 'dotenv/config';

async function explainQueries() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  
  const queries = [
    { name: '1. Rep quotation list (owner_id + status)', sql: "EXPLAIN ANALYZE SELECT * FROM quotations WHERE owner_id = '00000000-0000-0000-0000-000000000000' AND status = 'open';" },
    { name: '2. Pipeline (status + created_at DESC)', sql: "EXPLAIN ANALYZE SELECT * FROM quotations WHERE status = 'negotiating' ORDER BY created_at DESC LIMIT 10;" },
    { name: '3. Product picker (category_id + active)', sql: "EXPLAIN ANALYZE SELECT * FROM products WHERE category_id = '00000000-0000-0000-0000-000000000000' AND active = true;" },
    { name: '4. Discount policy lookup (tier_id/category_id)', sql: "EXPLAIN ANALYZE SELECT * FROM discount_policies WHERE tier_id = '00000000-0000-0000-0000-000000000000' AND category_id = '00000000-0000-0000-0000-000000000000';" },
    { name: '6. Approval queue (pending + risk_score DESC)', sql: "EXPLAIN ANALYZE SELECT * FROM approvals WHERE status = 'pending' ORDER BY risk_score DESC LIMIT 10;" },
    { name: '7. Manager/Finance pending approvals', sql: "EXPLAIN ANALYZE SELECT * FROM approvals WHERE approver_role = 'manager' AND status = 'pending';" },
    { name: '11. Open backorders (status = PENDING)', sql: "EXPLAIN ANALYZE SELECT * FROM backorders WHERE status = 'pending';" },
    { name: '17. Deal health open alerts', sql: "EXPLAIN ANALYZE SELECT * FROM deal_health_alerts WHERE unresolved = true AND severity = 'critical' ORDER BY created_at DESC;" },
  ];

  for (const q of queries) {
    console.log(`\\n--- ${q.name} ---`);
    try {
      const res = await pool.query(q.sql);
      res.rows.forEach(r => console.log(r['QUERY PLAN']));
    } catch (e) {
      console.error(e.message);
    }
  }

  await pool.end();
}

explainQueries().catch(console.error);
