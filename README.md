# TimeWise EMS2

Branches:
- `ems2`      -> ems.drpca.com  (LIVE, Netlify site sparkly-marshmallow-838c49)
- `ems2-test` -> ems2.drpca.com (TEST, Netlify site drp-ems2, gold TEST PORTAL ribbon)

Workflow: commit to `ems2-test`, check on ems2.drpca.com, then merge into `ems2` to go live.
Both portals share the same live Supabase database (drp-ems2).
