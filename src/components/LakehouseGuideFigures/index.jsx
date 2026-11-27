import React from 'react';
import styles from './styles.module.scss';

// The small, 15-degree plates echo the architecture illustrations on iomete.com.
// All explanatory labels remain HTML text to follow the article's type scale.
function Layer({ tone = 'lake', stack = false }) {
  const plate = (offset) => (
    <g key={offset} transform={`translate(0 ${offset})`}>
      <path d="M2 11 32 3 62 11 32 19Z" fill="var(--plate-top)" />
      <path d="M2 11 32 19 32 26 2 18Z" fill="var(--plate-front)" />
      <path d="M32 19 62 11 62 18 32 26Z" fill="var(--plate-side)" />
    </g>
  );
  return <svg className={styles.layer} data-tone={tone} viewBox="0 0 64 40" aria-hidden="true" focusable="false" stroke="var(--plate-edge)" strokeWidth="0.9" strokeLinejoin="round">{stack && plate(10)}{plate(stack ? 2 : 7)}</svg>;
}
function Node({ tone, stack, name, detail }) {
  return <div className={styles.node}><Layer tone={tone} stack={stack} /><span><strong>{name}</strong>{detail && <small>{detail}</small>}</span></div>;
}
function Fork() {
  return <svg className={styles.fork} viewBox="0 0 50 80" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M0 40H15Q20 40 20 35V8Q20 5 24 5H49 M15 40Q20 40 20 45V72Q20 75 24 75H49" fill="none" stroke="currentColor" strokeWidth="1.2" vectorEffect="non-scaling-stroke"/></svg>;
}
export function CatalogPaths() {
  return <figure className={styles.figure} aria-label="How Spark reads an Iceberg table" data-blog-figure="catalog-access">
    <div className={styles.tree}>
      <Node name="Spark client" tone="geode" stack />
      <Fork />
      <div className={styles.branches}>
        <Node name="REST catalog" detail="Locate the current metadata" tone="lake" />
        <Node name="Object storage" detail="Read the table files" tone="racing" stack />
      </div>
    </div>
    <figcaption>Listing a table tests the catalog connection. Reading a row tests storage access, too.</figcaption>
  </figure>;
}
export function RevenueTrace() {
  return <figure className={styles.figure} aria-label="How paid orders contribute to daily revenue" data-blog-figure="lineage-revenue">
    <div className={styles.contributions}>
      <div><span className={styles.label}>Paid orders</span><div className={styles.bar}><span>20.00</span><span>10.00</span></div></div>
      <span className={styles.math} aria-hidden="true">=</span>
      <div className={styles.total}><span className={styles.label}>Daily revenue</span><strong>30.00</strong></div>
    </div>
    <figcaption>The filter excludes the cancelled order (50.00) before the sum.</figcaption>
  </figure>;
}
export function DeploymentLayers() {
  return <figure className={styles.figure} aria-label="Lakehouse deployment layers" data-blog-figure="ownership-layers">
    <dl className={styles.layers}>
      <div><dt><Layer tone="apricot" />External tools</dt><dd>Source systems, ingestion tools and BI clients</dd></div>
      <div><dt><Layer tone="lake" />IOMETE services</dt><dd>Gateway, catalog and Spark workloads</dd></div>
      <div><dt><Layer tone="racing" />Your infrastructure</dt><dd>Kubernetes, object storage and PostgreSQL</dd></div>
    </dl>
  </figure>;
}
export function ReportInputs({ persisted = false }) {
  return <figure className={styles.figure} aria-label="Data sources for the revenue report" data-blog-figure={persisted ? 'report-copy' : 'report-live'}>
    <div className={`${styles.tree} ${styles.join}`}>
      <div className={styles.branches}>
        <Node tone="lake" stack name="Iceberg orders" detail="Order amounts" />
        <Node tone={persisted ? 'racing' : 'apricot'} stack={persisted} name={persisted ? 'Iceberg copy' : 'Customer database'} detail={persisted ? 'Last refreshed segments' : 'Live customer segments'} />
      </div>
      <Fork />
      <div className={styles.report}>Revenue<br/>by segment</div>
    </div>
    <figcaption>{persisted ? 'If the customer database is offline, the report still reads the last successful copy.' : 'If the customer database is offline, this join cannot return the report.'}</figcaption>
  </figure>;
}

// This is an illustrative acceptance test, not a product lineage viewer.
export function OrderTrace() {
  const [selected, setSelected] = React.useState('paid');
  const [run, setRun] = React.useState(0);
  const paid = selected === 'paid';
  function trace(value) { setSelected(value); setRun((n) => n + 1); }
  return <figure className={styles.figure} aria-label="Example order trace" data-blog-figure="lineage-trace">
    <div className={styles.traceChoices} role="group" aria-label="Choose an example order">
      <button type="button" aria-pressed={paid} onClick={() => trace('paid')}>Paid order</button>
      <button type="button" aria-pressed={!paid} onClick={() => trace('cancelled')}>Cancelled order</button>
    </div>
    <div className={styles.trace}>
      <div className={styles.route} aria-hidden="true">
        <div key={run} className={`${styles.activeRoute} ${run ? styles.replay : ''}`} style={{width: paid ? '100%' : '50%'}} />
        <i /><i /><i data-reached={paid} />
      </div>
      <div className={styles.stops}>
        <div><span>Raw amount</span><strong>{paid ? '10.00' : '50.00'}</strong></div>
        <div><span>Status filter</span><strong>{paid ? 'Keep row' : 'Drop row'}</strong></div>
        <div><span>Daily revenue</span><strong>{paid ? '+10.00' : 'No contribution'}</strong></div>
      </div>
    </div>
    <figcaption aria-live="polite">{paid ? 'Order 02 passes the filter. Its line amount contributes to the daily total.' : 'Order 03 stops at the filter. Its amount never reaches the daily total.'}</figcaption>
  </figure>;
}
