import { BOOKING_STEPS, COST_ROWS } from '../data/reference';

type CostsViewProps = {
  doneSteps: string[];
  onToggleStep: (id: string) => void;
};

export const CostsView = ({ doneSteps, onToggleStep }: CostsViewProps) => {
  const done = BOOKING_STEPS.filter((step) => doneSteps.includes(step.id)).length;
  const all = done === BOOKING_STEPS.length;
  return (
    <>
      <section className="intro" aria-labelledby="book-h">
        <div className="intro-head">
          <h2 id="book-h">Book in this order</h2>
          <span className={`steps-progress${all ? ' all' : ''}`} aria-live="polite">
            {all ? 'All booked' : `${done} of ${BOOKING_STEPS.length} done`}
          </span>
        </div>
        <ol className="steps">
          {BOOKING_STEPS.map((step) => {
            const checked = doneSteps.includes(step.id);
            return (
              <li key={step.id} className={checked ? 'done' : undefined}>
                <label className="step">
                  <input className="step-check" type="checkbox" checked={checked} onChange={() => onToggleStep(step.id)} />
                  <span className="step-body">
                    <b>{step.title}</b>
                    <span>{step.detail}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="ref" aria-labelledby="costs-h">
        <h2 id="costs-h">Costs per diver</h2>
        <p>Using the cheapest listed operator for each day. Nitrox is estimated at 200–350 THB a tank where the shop does not publish a price. Gear rental and tips are extra.</p>
        <div className="tablebox">
          <table>
            <thead>
              <tr><th>Day</th><th>Trip</th><th>Operator</th><th className="n">Trip</th><th className="n">Park fee</th><th className="n">Nitrox</th></tr>
            </thead>
            <tbody>
              {COST_ROWS.map((row) => (
                <tr key={row.day}>
                  <td>{row.day}</td><td>{row.trip}</td><td>{row.operator}</td>
                  <td className="n">{row.price}</td><td className="n">{row.parkFee}</td><td className="n">{row.nitrox}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr><td colSpan={3}>Total, 13 dives (all in THB)</td><td className="n">20,600</td><td className="n">1,300</td><td className="n">2,800–4,000</td></tr>
              <tr><td colSpan={3}>Grand total</td><td className="n" colSpan={3}>24,700–25,900 THB</td></tr>
              <tr><td colSpan={3}>If Friday is cancelled</td><td className="n" colSpan={3}>20,200–20,950 THB</td></tr>
            </tfoot>
          </table>
        </div>
        <p>
          <b>Tue 3 Nov Phi Phi tour</b> is prepaid on Klook. On the day, bring cash: 400 THB park fee per person, plus optional fins, longtail, beach chairs and tips.
          About 2,500–3,000 THB for two covers it.
        </p>
      </section>
    </>
  );
};
